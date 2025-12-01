import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { addressFormSchema } from '$lib/formSchemas/addressFormSchema';
import { prisma } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';
import { DEV_ME_KEY } from '$env/static/private';
import type { Address } from '../../../generated/prisma/client';

export const load:PageServerLoad = (async () => {
   const addressForm = await superValidate(valibot(addressFormSchema));

   return { addressForm, };
})

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, valibot(addressFormSchema));
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
         let newAddress:Omit<Address, 'addressId' | 'phoneNum1Validated' | 'softDelete'>;
         if(oldAddress){
            oldAddress = await prisma.address.update({
               where:{
                  addressId: oldAddress.addressId
               },
               data: {
                  softDelete: true,
               }
            })
            let phoneValid;
            if(data.phoneNum1){
               const phoneValidResponse = await fetch(`https://api.dev.me/v1-get-phone-details?phone=${addressForm.data.phoneNum1Country}${addressForm.data.phoneNum1}`,
                  {
                     headers: {
                        'Accept': 'application/json',
                        'x-api-key': DEV_ME_KEY
                     }
                  }
               )
               phoneValid = await phoneValidResponse.json();
               if(!phoneValid.valid){
                  return message(addressForm, 'Phone number not valid')
               }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            newAddress = {
               phoneNum1:phoneValid.nationalNumber,
               phoneNum1Country: phoneValid.callingCode,
               address1: data.address1 ? data.address1 : oldAddress.address1, 
               address2: data.address2 ? data.address2 : oldAddress.address2,
               city: data.city ? data.city : oldAddress.city, 
               state: data.state? data.state : oldAddress.state,
               postalCode: data.postalCode ? data.postalCode : oldAddress.postalCode,
               country: data.country ? data.country : oldAddress.country,
               userId: data.userId
            }
            const dbAddress = await prisma.address.create({
               data: newAddress
            })
            const redirectTo = event.url.searchParams.get('redirectTo');
            if(redirectTo){
               redirect(303, `/${redirectTo}?addressId=${dbAddress.addressId}&userId=${data.userId}`)
            }
         }
      }
      return {addressForm}
   }
};