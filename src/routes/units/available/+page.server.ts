import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/schemas';
import pricingData from '$lib/server/pricingData';

export const load:PageServerLoad = (async (event) => {
   const userId = event.url.searchParams.get('userId');
   const unitNotesForm = await superValidate(zod(unitNotesFormSchema));
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
      }
   })
   const unitCount = await prisma.unit.count();
   const sizes:string[] = []
   pricingData.forEach((datum) => {
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   })
   return { availableUnits, userId, unitCount, unitNotesForm, sizes }; 
}) 