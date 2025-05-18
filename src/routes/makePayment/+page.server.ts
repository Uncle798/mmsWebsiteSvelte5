import { redirect,  error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   const newLease = event.url.searchParams.get('newLease');
   const subscription = event.url.searchParams.get('subscription');
   const leaseId = event.url.searchParams.get('leaseId')
   if(!invoiceNum){
      throw error(400, 'No invoice number provided')
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum:parseInt(invoiceNum!, 10),
      }
   })
   if(!invoice){
      throw error(400, 'No invoice found')
   }
   const customer = await prisma.user.findFirst({
      where: {
         id: invoice.customerId!, 
      }
   })
   const stripeId = event.url.searchParams.get('stripeId');

   return { invoice, stripeId, customer, newLease, subscription, leaseId };
})
