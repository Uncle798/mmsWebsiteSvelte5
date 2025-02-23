import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/schemas';
import pricingData from '$lib/server/pricingData';

export const load:PageServerLoad = (async (event) => {
   const userId = event.url.searchParams.get('userId');
   const unitNotesForm = await superValidate(zod(unitNotesFormSchema));
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
   const unitCount = await prisma.unit.count();
   const sizes:string[] = []
   pricingData.forEach((datum) => {
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   })
   return { units, leases, userId, unitCount, unitNotesForm, sizes }; 
}) 