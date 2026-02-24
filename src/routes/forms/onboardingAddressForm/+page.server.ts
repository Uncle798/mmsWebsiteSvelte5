import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingAddressFormSchema } from '$lib/formSchemas/onboardingAddressFormSchema';
import { prisma } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';
import { ABSTRACT_API_KEY } from '$env/static/private';

export const load:PageServerLoad = (async () => {
   const addressForm = await superValidate(valibot(onboardingAddressFormSchema));

   return { addressForm, };
})

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, valibot(onboardingAddressFormSchema));
      const { success, reset } = await ratelimit.customerForm.limit(event.locals.user.id)
		if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(addressForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const { data } = addressForm;
      if( !event.locals.user.employee && data.userId !== event.locals.user.id){
         error(403, {message: 'Not your address to change'});
      }
      if(addressForm.valid){
         let oldAddress = await prisma.address.findFirst({
            where: {
               AND: [
                  {userId: data.userId},
                  {softDelete: false},
               ]
            }
         });
         if(oldAddress){
            oldAddress = await prisma.address.update({
               where:{
                  addressId: oldAddress.addressId
               },
               data: {
                  softDelete: true,
               }
            })
         }
         let phoneValid;
         if(data.phoneNum1){
            const phoneValidResponse = await fetch(`https://phoneintelligence.abstractapi.com/v1?api_key=${ABSTRACT_API_KEY}&phone=${addressForm.data.phoneNum1Country}${addressForm.data.phoneNum1}`)
            phoneValid = await phoneValidResponse.json();
            console.log(phoneValid)
            if(phoneValid && !phoneValid.phone_validation.is_valid){
               return message(addressForm, 'Phone number not valid')
            }
            if(phoneValid.phone_risk.risk_level !== 'low'){
               return message(addressForm, 'Phone number is to risky')
            }
         }
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const dbAddress = await prisma.address.create({
            data: addressForm.data
         })
         const redirectTo = event.url.searchParams.get('redirectTo');
         if(redirectTo){
            redirect(303, `/${redirectTo}?addressId=${dbAddress.addressId}&userId=${data.userId}`)
         }
      }
      return {addressForm}
   }
};