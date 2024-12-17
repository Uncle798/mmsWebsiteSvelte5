import { prisma } from '$lib/server/prisma';
import type { Unit } from '@prisma/client';
import type { PageServerLoad } from './$types';

export const load:PageServerLoad = (async (event) => {
   const leases = await prisma.lease.findMany({
      where: {
         leaseEnded: null
      }
   });
   const units = await prisma.unit.findMany({
      orderBy: {
         num: 'asc'
      }, 
      where: {
         unavailable: false
      }
   })
   const availableUnits:Unit[] = [];
   units.forEach((unit) => {
      const lease = leases.find((l) => l.unitNum === unit.num)
      if(!lease){
         availableUnits.push(unit);
      }
   })
   const userId = event.url.searchParams.get('userId')
   return { availableUnits, userId }; 
}) 