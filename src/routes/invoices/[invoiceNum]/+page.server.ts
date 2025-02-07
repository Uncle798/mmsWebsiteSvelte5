import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const invoiceNum = event.params.invoiceNum;
   const invoice = await prisma.invoice.findFirst({
      where: {
         invoiceNum:parseInt(invoiceNum, 10),
      },
   })
   if(!invoice){
      fail(404)
   }
   const customer = await prisma.user.findFirst({
      where: {
         id: invoice!.customerId!
      }
   })
   const address = await prisma.address.findFirst({
      where: {
         userId: invoice!.customerId!
      }
   })
    return { invoice, address, customer };
}) satisfies PageServerLoad;