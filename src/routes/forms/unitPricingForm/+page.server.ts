import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';
import { unitPricingFormSchema } from '$lib/formSchemas/unitPricingFormSchema';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      const unitPricingForm = await superValidate(formData, valibot(unitPricingFormSchema));
      
      if(!unitPricingForm.valid){
         error(400);
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user?.id)
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
      if(unitPricingForm.data.price < unit?.advertisedPrice && unitPricingForm.data.lowerPrice === false){
         return message(unitPricingForm, `Please select Lower Price to lower the price of all\
               ${unitPricingForm.data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units.` )
      }
      if(unitPricingForm.data.price === unit?.advertisedPrice && unitPricingForm.data.lowerPrice === false){
         return message(unitPricingForm, 
            `No change in price for ${unitPricingForm.data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units.` )
      }
      let deposit = unit.advertisedPrice;
      if(unitPricingForm.data.changeDeposit){
         deposit = unitPricingForm.data.price
      }
      await prisma.unit.updateMany({
         where: {
            size: unitPricingForm.data.size,
         },
         data: {
            advertisedPrice: unitPricingForm.data.price,
            deposit,
         }
      })
      return { unitPricingForm }
   },
};