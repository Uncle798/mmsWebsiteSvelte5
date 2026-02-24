import { redirect } from '@sveltejs/kit';
import pricingData from '$lib/server/pricingData';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const sizes:string[] = [];
   pricingData.forEach((data) =>{
      if(data.size !== 'ours'){
         sizes.push(data.size)
      }
   });
   const units = await prisma.unit.findMany({
      orderBy: {
         size: 'asc'
      },
      where: {
         NOT: {
            size: 'ours'
         }
      }
   });
   return { sizes, units };
}) satisfies PageServerLoad;