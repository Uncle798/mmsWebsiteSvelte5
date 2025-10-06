import { redirect } from '@sveltejs/kit';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot, } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      const unitNotesForm = await superValidate(formData, valibot(unitNotesFormSchema));
      if(!unitNotesForm.valid){
         message(unitNotesForm, 'Form not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id)
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(unitNotesForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      await prisma.unit.update({
         where: {
            num: unitNotesForm.data.unitNum
         },
         data: {
            unavailable: unitNotesForm.data.unavailable,
            notes: unitNotesForm.data.notes
         }
      })
      return { unitNotesForm }
   }
};