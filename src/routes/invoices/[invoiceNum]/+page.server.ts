import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const invoiceNum = event.params.invoiceNum;
   const invoice = await prisma.invoice.findFirst({
      where: {
         invoiceNum:parseInt(invoiceNum, 10),
      },
      include: {
         customer: true
      }
   })

    return { invoice };
}) satisfies PageServerLoad;