import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
   const earliestRecord = await prisma.paymentRecord.findFirst({
      orderBy: {
         paymentCreated: 'asc'
      }
   })
   const years:number[] = [];
   if(earliestRecord){
      const earliestYear = earliestRecord!.paymentCreated.getFullYear()
      const thisYear = new Date().getFullYear();
      for(let i=earliestYear; i<=thisYear; i++){
         years.push(i);
      }
      
   }
   return {years};
}) satisfies PageServerLoad;