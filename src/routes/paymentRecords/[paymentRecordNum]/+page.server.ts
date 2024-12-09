import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
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