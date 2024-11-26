import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import { zod } from 'sveltekit-superforms/adapters';
import { employmentFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {

    return {};
}) satisfies PageServerLoad;

export const actions:Actions = {
   default: async (event) =>{
      if(!event.locals.user?.admin){
         redirect(302, '/login?toast=admin');
      }
      const formData = await event.request.formData();
      const employmentChangeForm = await superValidate(formData, zod(employmentFormSchema));
      const { success, reset } = await ratelimit.register.limit(event.locals.user.id)
      if(!success) {
          const timeRemaining = Math.floor((reset - Date.now()) /1000);
          return message(employmentChangeForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      if(!employmentChangeForm.valid){
         return message(employmentChangeForm, 'not valid');
      }
      if(employmentChangeForm.data.userId === event.locals.user.id){
         return message(employmentChangeForm, 'Unable to change own employment status'); 
      }
      await prisma.user.update({
         where: {
            id: employmentChangeForm.data.userId,
         },
         data: {
            admin: employmentChangeForm.data.admin ? true : false,
            employee: employmentChangeForm.data.employee ? true : false,
         }
      })
      return message(employmentChangeForm, 'Employment changed successfully ')
   }
}