import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
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