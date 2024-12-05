import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const POST:RequestHandler = async (event) => {
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   if(!invoiceNum){
      fail(404)
   }
   const invoice = await prisma.invoice.findUnique({
      where:{
         invoiceNum:parseInt(invoiceNum!, 10),
      }
   })
   if(!invoice){
      return new Response(JSON.stringify('not found'),{status:404})
   }
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
      setup_future_usage: 'off_session'
   })
   return new Response(JSON.stringify(paymentIntent.client_secret), {status:200});
}
