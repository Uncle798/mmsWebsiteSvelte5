import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_COMPANY_NAME } from '$env/static/public';

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
      const price = await stripe.prices.create({
         currency: 'usd',
         product_data:{
            name: `Monthly Rent for unit ${lease?.unitNum.replace(/^0+/gm,'')}`,
            statement_descriptor: `${PUBLIC_COMPANY_NAME}`
         },
         unit_amount_decimal: lease!.price.toFixed(2)
      })
      try {         
         const stripeSubscription = await stripe.subscriptions.create({
            customer: customer.stripeId!,
            currency: 'usd',
            description: `Monthly Rent for unit ${lease?.unitNum}`,
            metadata: {
               leaseId: lease!.leaseId
            },
            items: [
               price,
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
         console.log('lease', lease)
         const setupIntent = await stripe.setupIntents.create({
            customer: customer.stripeId ? customer.stripeId : undefined,
            description: stripeSubscription.description ? stripeSubscription.description : undefined,
         })
         console.log(setupIntent);
         return new Response(JSON.stringify(setupIntent.client_secret), {status: 200})
      } catch (error) {
         console.error(error)
      }
   }

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
