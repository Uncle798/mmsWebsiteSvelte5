import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const units = await prisma.unit.findMany({
      where: {
         unavailable: true
      }
   })
   return { units };
}) satisfies PageServerLoad;