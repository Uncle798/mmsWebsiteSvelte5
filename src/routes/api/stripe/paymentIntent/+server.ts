import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_COMPANY_NAME } from '$env/static/public';
import dayjs from 'dayjs';

export const POST:RequestHandler = async (event) => {
   const body = await event.request.json();
   console.log('body', body)
   const { customerId, invoiceNum, subscription, } = body;
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
      console.log('subscriptionStartDate', subscriptionStartDate.toDate())
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
      try {         
         const stripeSubscription = await stripe.subscriptionSchedules.create({
            customer: customer.stripeId!,
            start_date: subscriptionStartDate.unix(),
            end_behavior: 'release',
            metadata: {
               leaseId: lease!.leaseId
            },
            default_settings: {
               description: `Monthly Rent for unit ${lease?.unitNum.replace(/^0+/gm, '')}`,
            },
            phases: [
               {
                  items: [
                     {
                        price: price.id,
                        quantity: 1,
                        metadata: {
                           leaseId: lease!.leaseId
                        }
                     },
                  ],
                  iterations: 1,
               }
            ]
         })
         lease = await prisma.lease.update({
            where:{
               leaseId: lease!.leaseId
            },
            data: {
               stripeSubscriptionId: stripeSubscription.id
            }
         })
         console.log('subscription: ', stripeSubscription)
         const setupIntent = await stripe.setupIntents.create({
            customer: customer.stripeId ? customer.stripeId : undefined,
            description: stripeSubscription.default_settings.description ? stripeSubscription.default_settings.description : undefined,
         })
         return new Response(JSON.stringify({client_secret: setupIntent.client_secret, startDate: subscriptionStartDate} ), {status: 200})
      } catch (error) {
         console.error(error)
      }
   } else{
         console.log(invoice)
         const paymentIntent = await stripe.paymentIntents.create({
            amount: invoice.invoiceAmount * 100,
            currency: 'usd',
            automatic_payment_methods: {
               enabled: true,
            },
            metadata:{
               invoiceNum,
               customerId: invoice.customerId,
            },
            setup_future_usage: 'off_session',
            customer: stripeId ? stripeId : undefined,
            description: invoice.invoiceNotes!,
         })
         return new Response(JSON.stringify(paymentIntent.client_secret), {status:200});
      }
      return new Response(null, {status:200});
}
