import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot, } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/unitNotesFormSchema';
import pricingData from '$lib/server/pricingData';
import type { Unit } from '@prisma/client';

export const load:PageServerLoad = (async (event) => {
   const userId = event.url.searchParams.get('userId');
   const unitNotesForm = await superValidate(valibot(unitNotesFormSchema));
   let availableUnits:Promise<Unit[]>;
   if(event.locals.user?.employee){
      availableUnits = prisma.unit.findMany({
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
            num: 'asc'
         }
      })
   } else {
      availableUnits = prisma.unit.findMany({
         where: {
            AND: [
               { unavailable: false },
               { size: {
                  not: 'ours',
               }},
               { lease: {
                  none: {
                     leaseEnded: null
                  }
               }}
            ]
         },
         orderBy: {
            num: 'asc'
         },
         distinct: ['size'] 
      })
   }
   const unitCount = await prisma.unit.count();
   const sizes:string[] = []
   pricingData.forEach((datum) => {
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   })
   return { availableUnits, userId, unitCount, unitNotesForm, sizes }; 
}) 