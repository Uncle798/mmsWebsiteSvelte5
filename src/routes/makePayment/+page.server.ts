import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   const newLease = event.url.searchParams.get('newLease');
   if(!invoiceNum){
      fail(404)
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum:parseInt(invoiceNum!, 10),
      }
   })
   if(!invoice){
      return fail(404)
   }
   const address = await prisma.address.findFirst({
      where: {
         userId: invoice.customerId!
      }
   })
   const customer = await prisma.user.findFirst({
      where: {
         id: invoice.customerId!, 
      }
   })
   const stripeId = event.url.searchParams.get('stripeId');

   return { invoice, address, stripeId, customer, newLease };
})
