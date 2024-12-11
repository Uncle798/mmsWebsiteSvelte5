import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { leaseDiscountFormSchema } from '$lib/formSchemas/schemas';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const leaseDiscountForm = await superValidate(formData, zod(leaseDiscountFormSchema));
      const { success, reset } = await ratelimit.customerForm.limit(event.locals.user.id)
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(leaseDiscountForm, `Please wait ${timeRemaining} seconds before trying again`) 
      }
      if(!leaseDiscountForm.valid){
         return message(leaseDiscountForm, 'Not valid');
      }
      const unitNum = leaseDiscountForm.data.unitNum
      const discount = await prisma.discountCode.findUnique({
         where: {
            code: leaseDiscountForm.data.code!
         }
      })
      if(discount){
         redirect(302, `/newLease?discountId=${discount?.discountId}&unitNum=${unitNum}`);
      }
      return message(leaseDiscountForm, 'Discount code not found, they are Case Sensitive');
   }
};