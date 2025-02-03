import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Invoice } from '@prisma/client';

export const load = (async (event) => {
   const invoiceNum = event.url.searchParams.get('invoiceNum')
   if(!event.locals.user){
      redirect(302, `/login?toast=unauthorized&redirectTo=invoicesPay&invoiceNum=${invoiceNum}`)
   }
   let invoice:Invoice | null = null;
   if(invoiceNum){
     invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: parseInt(invoiceNum, 10)
         }
      })
   }
   return { invoice, };
}) satisfies PageServerLoad;