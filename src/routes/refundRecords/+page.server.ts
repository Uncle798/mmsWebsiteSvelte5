import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const refunds = await prisma.refundRecord.findMany({
      orderBy: {
         refundCompleted: {
            sort: 'desc',
            nulls: 'first'
         }
      }
   })
   return { refunds };
}) satisfies PageServerLoad;

