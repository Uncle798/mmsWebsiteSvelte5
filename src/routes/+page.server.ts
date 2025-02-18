import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import pricingData from '$lib/server/pricingData';
export const load:PageServerLoad = (async () => {
   const leases = prisma.lease.findMany({
      where: {
         leaseEnded: null
      }
   });
   const units = prisma.unit.findMany({
      orderBy: {
         size: 'asc'
      }, 
      where: {
         unavailable: false
      },
   });
   const sizes:string[] = [];
   pricingData.forEach((datum) => {
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   })
   return { units, leases, sizes }
})