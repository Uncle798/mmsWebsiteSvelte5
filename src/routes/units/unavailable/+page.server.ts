import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const units = await prisma.unit.findMany({
      where: {
         unavailable: true
      }
   })
   const unitNotesForm = await superValidate(zod(unitNotesFormSchema));
   return { units, unitNotesForm };
}) satisfies PageServerLoad;