import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   const paymentRecordNum = event.params.paymentRecordNum;
   const paymentRecord = await prisma.paymentRecord.findUnique({
      where: {
         paymentNumber:parseInt(paymentRecordNum, 10)
      },
      include: {
         customer: true
      }
   })
    return { paymentRecord };
}) satisfies PageServerLoad;