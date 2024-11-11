import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceId = event.url.searchParams.get('invoiceId');
   if(!invoiceId){
      fail(500,{message:'unable to find invoice'})
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceId:invoiceId!,
      }
   })
   console.log(invoice);
   return { invoice };
})

export const actions: Actions = {
   default: async (event) =>{

   }
};