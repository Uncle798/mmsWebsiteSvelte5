import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const refundRecordNum = event.params.refundNumber;
   const refundRecord = await prisma.refundRecord.findUnique({
      where: { 
         refundNumber: parseInt(refundRecordNum, 10)
      },
      include: {
         customer: true
      },
   })
   return { refundRecord, };
}) satisfies PageServerLoad;