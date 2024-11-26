import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

   const size = event.params.size
   const units = await prisma.unit.findMany({
      where: {
         size
      },
      orderBy: {
         num: 'asc'
      },
      include: {
         lease:{
            where: {
               leaseEnded: null
            }
         }
      }
   })
   
   return { units, size };
}) satisfies PageServerLoad;