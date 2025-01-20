
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { leaseEndFormSchema, unitNotesFormSchema, unitPricingFormSchema } from '$lib/formSchemas/schemas';


export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const unitNum = event.params.unitNum;
   if(!unitNum){
      fail(400)
   }
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum
      }, 
      include: {
         lease: {
            include: {
               customer: true
            },
            orderBy: {
               leaseEnded:{
                  sort: 'desc',
                  nulls: 'first',               }
            }
         }
      }
   });
   const unitNotesForm = await superValidate(zod(unitNotesFormSchema));
   const unitPricingForm = await superValidate(zod(unitPricingFormSchema));
   const leaseEndForm = await superValidate(zod(leaseEndFormSchema));
   return { unit, unitNotesForm, unitPricingForm, leaseEndForm };
}) satisfies PageServerLoad;