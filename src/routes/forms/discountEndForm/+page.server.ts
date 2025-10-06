import { cuidIdFormSchema } from "$lib/formSchemas/schemas";
import { prisma } from "$lib/server/prisma";
import { ratelimit } from "$lib/server/rateLimit";
import { error, redirect, type Actions } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const discountEndForm = await superValidate(formData, valibot(cuidIdFormSchema));
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user?.id)
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(discountEndForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      if(!discountEndForm.valid){
         error(400);
      }
      await prisma.discountCode.update({
         where: {
            discountId: discountEndForm.data.cuid2Id
         },
         data: {
            discountEnded: new Date(),
         }
      }).catch((err) => {
         console.error(err)
      })
   }
};