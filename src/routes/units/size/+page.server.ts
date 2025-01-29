import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const allUnits = await prisma.unit.findMany({
      orderBy:{
         size: 'asc'
      },
      where:{
         size: {
            not: 'ours'
         }
      }
   });
   const sizes:string[] = [];
   allUnits.forEach((unit) =>{
      const unitSize = unit.size;
      const sizeSize = sizes.find((size) => size === unitSize);
      if(!sizeSize){
         sizes.push(unitSize);
      }
   })
   return { sizes, };
}) satisfies PageServerLoad;