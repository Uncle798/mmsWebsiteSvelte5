import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_COMPANY_NAME } from '$env/static/public';
import dayjs from 'dayjs';

export const POST:RequestHandler = async (event) => {
   const body = await event.request.json();
   const { customerId, invoiceNum, subscription, } = body;
   console.log(body)
   if(!invoiceNum){
      return new Response(JSON.stringify('Invoice not provided'), { status:400 });
   }
   let customer = await prisma.user.findUnique({
      where: {
         id: customerId
      }
   })
   let stripeId:string | null | undefined = customer?.stripeId
   if(!customer?.stripeId){
      const stripeCustomer = await stripe.customers.create({
         email: customer!.email!,
         name: `${customer?.givenName} ${customer?.familyName}`

      })
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
      return new Response(JSON.stringify('not found'),{status:404})
   }
   if(subscription === 'true'){
      let lease = await prisma.lease.findUnique({
         where: {
            leaseId: invoice.leaseId!
         }
      });
      if(!lease){
         new Response(JSON.stringify('Lease not found'), {status: 404})
      }
      let subscriptionStartDate = dayjs(lease?.leaseEffectiveDate).add(1,'month');
      const invoices = await prisma.invoice.findMany({
         where: {
            AND:[
               {leaseId: lease?.leaseId},
               {deposit: false},
               {invoiceNotes: {
                  contains: 'rent'
               }}             
            ]
         },
         orderBy: {
            invoiceCreated: 'desc'
         },
         take: 1,

      })
      if(invoices[0]){
         if(invoices[0].paymentRecordNum){
            subscriptionStartDate = dayjs(invoice.invoiceCreated).add(2, 'month');
         } else {
            subscriptionStartDate = dayjs(invoices[0].invoiceCreated).add(1, 'month');
         }
      }
      const price = await stripe.prices.create({
         currency: 'usd',
         product_data:{
            name: `Monthly Rent for unit ${lease?.unitNum.replace(/^0+/gm,'')}`,
            statement_descriptor: `${PUBLIC_COMPANY_NAME}`,
            
         },
         unit_amount_decimal: lease!.price.toFixed(2),
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
      }
      return new Response(null, {status:200});
}
