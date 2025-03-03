import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { DEV_ME_KEY } from '$env/static/private';

export const load:PageServerLoad = (async () => {
   const addressForm = await superValidate(zod(addressFormSchema));

   return { addressForm, };
})

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const userId = event.url.searchParams.get('userId');
      if(!userId){
         return fail(400, {message: 'User not specified'})
      }
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, zod(addressFormSchema));
      const { success, reset } = await ratelimit.customerForm.limit(event.locals.user.id)
		if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(addressForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      if( !event.locals.user.employee && userId !== event.locals.user.id){
         return fail(403, {message: 'Not your address to change'});
      }
      let oldAddress = await prisma.address.findFirst({
         where: {
            AND: [
               {userId: userId},
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
      const phoneValidResponse = await fetch(`https://api.dev.me/v1-get-phone-details?phone=${addressForm.data.phoneNum1Country}${addressForm.data.phoneNum1}`,
         {
            headers: {
               'Accept': 'application/json',
               'x-api-key': DEV_ME_KEY
            }
         }
      )
      const phoneValid = await phoneValidResponse.json()
      if(!phoneValid.valid){
         message(addressForm, 'Phone number not valid')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {phoneNum1, phoneNum1Country, ...rest} = addressForm.data
         const newAddress = {
            userId,
            phoneNum1:phoneValid.nationalNumber,
            phoneNum1Country: phoneValid.callingCode,
            ...rest
         }
         await prisma.address.create({
            data: newAddress
         })
      // }
      // if(data.result.verificationStatus === 'unverified'){
      //    return message(addressForm, 'Unable to verify address, please contact the office');
      // }
      return {addressForm}
   }
};