import { discountEndFormSchema } from "$lib/formSchemas/schemas";
import { prisma } from "$lib/server/prisma";
import { ratelimit } from "$lib/server/rateLimit";
import { redirect, type Actions } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const discountEndForm = await superValidate(formData, zod(discountEndFormSchema));
      const { success, reset } = await ratelimit.register.limit(event.locals.user?.id)
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(discountEndForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      if(!discountEndForm.valid){
         fail(400, discountEndForm);
      }
      await prisma.discountCode.update({
         where: {
            discountId: discountEndForm.data.discountId
         },
         data: {
            discountEnded: new Date(),
         }
      })
   }
};