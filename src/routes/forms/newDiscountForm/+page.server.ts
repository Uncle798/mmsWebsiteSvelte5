import { superValidate, message, fail } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { newDiscountFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';


export const actions: Actions = {
   default: async (event) =>{
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      const newDiscountForm = await superValidate(formData, zod(newDiscountFormSchema));
      const { success, reset } = await ratelimit.employeeForm.limit( event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset-Date.now()) / 1000);
         return message(newDiscountForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      if(!newDiscountForm.valid){
         fail(400, newDiscountForm);
      }
      await prisma.discountCode.create({
         data: {
            code:newDiscountForm.data.code,
            notes: newDiscountForm.data.notes,
            userId: event.locals.user.id,
            amountOff: newDiscountForm.data.amountOff
         }
      })
      return { newDiscountForm };
   }
};