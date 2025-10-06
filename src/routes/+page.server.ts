import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import pricingData from '$lib/server/pricingData';
export const load:PageServerLoad = (async (event) => {
   const availableUnits = prisma.unit.findMany({
      where: {
         AND: [
            { unavailable: false },
            { size: {
               not: 'ours' 
            }},
            { lease: {
               none: {
                  leaseEnded: null
               }
            }}
         ]
      },
      orderBy: {
         size: 'asc'
      },
      distinct: ['size']
   })
   const sizes:string[] = [];
   pricingData.forEach((datum) => {
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   })
   const demoCookie =  event.cookies.get('homeComplete');
   return { availableUnits, sizes, demoCookie };
})