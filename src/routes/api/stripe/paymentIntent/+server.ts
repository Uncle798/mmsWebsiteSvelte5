import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from '@sveltejs/kit';

export const POST:RequestHandler = async (event) => {
   const body = await event.request.json();
   console.log('body', body)
   const { customerId, invoiceNum } = body;
   if(!invoiceNum){
      return new Response(JSON.stringify('Invoice not provided'), { status:400 });
   }
   const customer = await prisma.user.findUnique({
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
      await prisma.user.update({
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
      where:{
         invoiceNum:parseInt(invoiceNum!, 10),
      }
   })
   if(!invoice){
      return new Response(JSON.stringify('not found'),{status:404})
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
   console.log(paymentIntent)
   return new Response(JSON.stringify(paymentIntent.client_secret), {status:200});
}
