import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/schemas';
import pricingData from '$lib/server/pricingData';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const units = await prisma.unit.findMany({
      where: {
         AND: [
            {unavailable: true},
            {size: {not: 'ours'}}
         ]
      },
   });
   const unitCount = await prisma.unit.count();
   const unitNotesForm = await superValidate(valibot(unitNotesFormSchema));
   const sizes:string[] = [];
   pricingData.forEach((datum) => {
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   })
   const cookie = event.cookies.get('unavailableDemoComplete');
   return { units, unitNotesForm, unitCount, sizes, cookie };
}) satisfies PageServerLoad;