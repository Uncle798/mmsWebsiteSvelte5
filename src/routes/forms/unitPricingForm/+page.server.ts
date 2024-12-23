import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { unitPricingFormSchema } from '$lib/formSchemas/schemas';

export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const unitPricingForm = await superValidate(formData, zod(unitPricingFormSchema));
      
      if(!unitPricingForm.valid){
         return fail(400, {unitPricingForm});
      }
      const { success, reset } = await ratelimit.login.limit(event.locals.user?.id || event.getClientAddress())
		if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(unitPricingForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const unit = await prisma.unit.findFirst({
         where: {
            size: unitPricingForm.data.size,
         }
      })
      if(!unit){
         return message(unitPricingForm, 'Size of unit not found')
      }
      if(unitPricingForm.data.price < unit?.advertisedPrice && unitPricingForm.data.lowerPrice === null){
         return message(unitPricingForm, `Please select Lower Price to lower the price of all\
               ${unitPricingForm.data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units.` )
      }
      if(unitPricingForm.data.price === unit?.advertisedPrice && unitPricingForm.data.lowerPrice === null){
         return message(unitPricingForm, 
            `No change in price for ${unitPricingForm.data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units.` )
      }
      await prisma.unit.updateMany({
         where: {
            size: unitPricingForm.data.size,
         },
         data: {
            advertisedPrice: unitPricingForm.data.price
         }
      })
      return { unitPricingForm }
   },
};