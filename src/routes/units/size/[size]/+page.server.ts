import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitPricingFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   const unitPricingForm = await superValidate(zod(unitPricingFormSchema));
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
   
   return { units, size, unitPricingForm };
}) satisfies PageServerLoad;