import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceId = event.url.searchParams.get('invoiceId');
   if(!invoiceId){
      fail(404,{message:'unable to find invoice'})
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceId:invoiceId!,
      }
   })
   if(!invoice){
      return fail(404)
   }
   const address = await prisma.contactInfo.findFirst({
      where: {
         userId: invoice.customerId!
      }
   })
   return { invoice, address };
})

export const actions: Actions = {
   default: async () =>{

   }
};