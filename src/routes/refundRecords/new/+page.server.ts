import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma'

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const paymentRecords = await prisma.paymentRecord.findMany({
      where: {
         refunded: false
      }
   })
   return { paymentRecords };
}) satisfies PageServerLoad;