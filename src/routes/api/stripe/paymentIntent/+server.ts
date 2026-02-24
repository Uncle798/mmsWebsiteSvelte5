import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_COMPANY_NAME } from '$env/static/public';
import dayjs from 'dayjs';
import { invoiceNoteRent } from '$lib/utils/invoiceNoteRent';

export const POST:RequestHandler = async (event) => {
   const body = await event.request.json();
   const { customerId, invoiceNum, subscription, } = body;
   if(!invoiceNum){
      return new Response(JSON.stringify('Invoice not provided'), { status:400 });
   }
   let customer = await prisma.user.findUnique({
      where: {
         id: customerId
      }
   })
   if(!customer){
      return new Response(JSON.stringify('Customer not found'), { status: 500})
   }
   let stripeId:string | null | undefined = customer.stripeId
   if(!customer.stripeId){
      const stripeCustomer = await stripe.customers.create({
         email: customer.email!,
         name: customer.organizationName ? customer.organizationName : `${customer?.givenName} ${customer?.familyName}`
      });
      customer = await prisma.user.update({
         where: {
            id: customer?.id
         },
         data: {
            stripeId: stripeCustomer.id
         }
      })
      stripeId = stripeCustomer.id
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum: parseInt(invoiceNum, 10)
      }
   })
   if(!invoice){
      return new Response(JSON.stringify('invoice not found'),{status:404})
   }
   if(subscription === 'true'){
      let lease = await prisma.lease.findUnique({
         where: {
            leaseId: invoice.leaseId!
         }
      });
      if(!lease){
         return new Response(JSON.stringify('Lease not found'), {status: 404})
      }
      let subscriptionStartDate = dayjs(lease?.leaseEffectiveDate).add(1,'month');
      const invoices = await prisma.invoice.findMany({
         where: {
            AND: [
               { leaseId: lease.leaseId},
               { invoiceAmount: {
                  lt: prisma.invoice.fields.amountPaid
               }}
            ]
         },
         orderBy: {
            invoiceDue: 'asc'
         }
      })
      if(invoices){
         subscriptionStartDate = dayjs(invoices[0].invoiceDue);
      }
      const price = await stripe.prices.create({
         currency: 'usd',
         product_data:{
            name: invoiceNoteRent(lease.unitNum, subscriptionStartDate.toDate()),
            statement_descriptor: `${PUBLIC_COMPANY_NAME}`,
            
         },
         unit_amount_decimal: lease.price.toFixed(2),
         recurring: {
            interval: 'month',
            interval_count: 1,
         },
         tax_behavior: 'inclusive',
         
      })
      const paymentIntent = await stripe.paymentIntents.create({
         amount: invoice.invoiceAmount * 100,
         currency: 'usd',
         automatic_payment_methods: {
            enabled: true,
         },
         metadata:{
            invoiceNum,
            customerId: invoice.customerId,
            deposit: invoice.deposit ? 'true' : 'false',
         },
         setup_future_usage: 'off_session',
         customer: stripeId ? stripeId : undefined,
         description: invoice.invoiceNotes!,
      })
      return new Response(JSON.stringify(paymentIntent.client_secret), {status:200});
   } else {
      const paymentIntent = await stripe.paymentIntents.create({
         amount: (invoice.invoiceAmount - invoice.amountPaid) * 100,
         currency: 'usd',
         metadata: {
            invoiceNum,
            customerId: invoice.customerId,
            deposit: invoice.deposit ? 'true' : 'false'
         },
         customer: stripeId ? stripeId : undefined,
         description: invoice.invoiceNotes ? invoice.invoiceNotes : undefined,
      })
      return new Response(JSON.stringify(paymentIntent.client_secret), {status: 200});
   }
   return new Response(null, {status:200});
}
