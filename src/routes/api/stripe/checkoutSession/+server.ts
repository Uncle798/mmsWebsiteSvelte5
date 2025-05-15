import { PUBLIC_URL } from '$env/static/public';
import { prisma } from '$lib/server/prisma';
import { stripe } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   const body = await event.request.json();
   const {  subscription, invoiceNum } = body;
   if(!invoiceNum){
      return new Response(JSON.stringify('invoiceNum not provided'), { status: 400});
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum: parseInt(invoiceNum, 10)
      }
   })
   if(!invoice){
      return new Response(JSON.stringify('invoice not found'), { status: 404 });
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: invoice!.customerId
      }
   });
   if(!customer){
      return new Response(JSON.stringify('Customer not found'), { status:404 });
   }
   console.log(customer)
   const previousSessions = await stripe.checkout.sessions.list({
      customer: customer.stripeId ? customer.stripeId : undefined
   })
   if(previousSessions){
      previousSessions.data.forEach((session) => {
         if(session.status === 'open')
         stripe.checkout.sessions.expire(session.id)
      })
   }
   if(subscription){  
      if(!invoice.leaseId){
         return new Response(JSON.stringify('LeaseId not provided'), { status:400 });
      }
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: invoice.leaseId
         }
      });
      if(!lease){
         return new Response(JSON.stringify('Lease not found'), { status:404 });
      }
      const session = await stripe.checkout.sessions.create({
         currency: 'usd',
         customer: customer?.stripeId ? customer.stripeId : undefined,
         mode: 'subscription',
         ui_mode: 'embedded',
         return_url: `${PUBLIC_URL}/thanks?customerId=${customer.id}`,
         line_items: [
            {
               price_data: {
                  currency: 'usd',
                  recurring: {
                     interval: 'month'
                  },
                  unit_amount: lease!.price * 100, 
                  product_data: {
                     name: `monthly rent for unit number ${lease.unitNum.replace(/^0+/gm,'')}`,
                     metadata: {
                        leaseId: lease.leaseId,
                        customerId: customer.id,
                     }
                  }
               },
               quantity: 1,
            }
         ],
         metadata: {
            customerId: customer.id
         }
      })
      return new Response(JSON.stringify(session.client_secret), { status: 200 });
   } else {

      const session = await stripe.checkout.sessions.create({
         currency: 'usd',
         customer: customer.stripeId ? customer.stripeId : undefined,
         mode: 'payment',
         ui_mode: 'embedded',
         return_url: `${PUBLIC_URL}/thanks?customerId=${customer.id}`,
         line_items: [
            {
               price_data: {
                  currency: 'usd',
                  unit_amount: invoice!.invoiceAmount * 100,
                  product_data:{
                     name: `Payment for invoice number: ${invoice.invoiceNum}`,
                     metadata: {
                        invoiceNum,
                        customerId: customer.id,
                     }
                  }
               },
               quantity: 1,
            }
         ]
      })
      return new Response(JSON.stringify(session.client_secret),  { status: 200 });
   }
};