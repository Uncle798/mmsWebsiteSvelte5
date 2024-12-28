import { PUBLIC_URL } from '$env/static/public';
import { prisma } from '$lib/server/prisma';
import { stripe } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   console.log(event.locals.user)
   const body = await event.request.json();
   const{ userId, leaseId } = body;
   if(!userId){
      return new Response(JSON.stringify('UserId not provided'), { status:400 });
   }
   if(!leaseId){
      return new Response(JSON.stringify('LeaseId not provided'), { status:400 });
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: userId
      }
   });
   if(!customer){
      return new Response(JSON.stringify('Customer not found'), { status:404 });
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId
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
      return_url: `${PUBLIC_URL}/thanks`,
      line_items: [
         {
            price_data: {
               currency: 'usd',
               recurring: {
                  interval: 'month'
               },
               unit_amount: lease!.price * 100, 
               product_data: {
                  name: `Monthly rent for unit number ${lease.unitNum}`,
                  metadata: {
                     leaseId: lease.leaseId,
                  }
               }
            },
            quantity: 1,
         }
      ],
      
   })
   const updatedLease = await prisma.lease.update({
      where: {
         leaseId: lease.leaseId
      },
      data: {
         stripeSubscriptionId: session.subscription?.toString(),
      }
   })
   console.log(updatedLease);
   return new Response(JSON.stringify(session.client_secret), { status: 200 });
};