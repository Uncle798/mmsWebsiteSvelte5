import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { message, superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { userNotesFormSchema } from "$lib/formSchemas/userNotesFormSchema";
import { ratelimit } from "$lib/server/rateLimit";
import { prisma } from "$lib/server/prisma";

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const userNotesForm = await superValidate(formData, valibot(userNotesFormSchema)); 
      if(!userNotesForm.valid){
         message(userNotesForm, 'Form not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user!.id)
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(userNotesForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      await prisma.user.update({
         where: {
            id: userNotesForm.data.userId
         },
         data: {
            doNotRent: userNotesForm.data.doNotRent,
            customerNotes: userNotesForm.data.notes
         }
      })
      return { userNotesForm }
   }
};