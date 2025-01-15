import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { qStash } from '$lib/server/qStash';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceNum = event.url.searchParams.get('invoiceNum');
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
   const stripeId = event.url.searchParams.get('stripeId');
   const timeLeft = await qStash.getWaiters({
      eventId: invoice!.leaseId!
   })
   console.log('payDeposit timeLeft', timeLeft);
   return { invoice, address, stripeId, timeLeft };
})
