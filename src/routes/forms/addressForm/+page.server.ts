import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { RADAR_SECRET_LIVE } from '$env/static/private';

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
      console.log(addressForm.data)
      const response = await fetch(`https://api.radar.io/v1/addresses/validate?city=${addressForm.data.city}&stateCode=${addressForm.data.state}&postalCode=${addressForm.data.postalCode}&addressLabel=${addressForm.data.address1}&unit=${addressForm.data.address2}&countryCode=${addressForm.data.country}`,
         {
            method: 'GET',
            headers: {
               Authorization: RADAR_SECRET_LIVE
            }
         }
      )
      const data = await response.json();
      console.log('data', data)
      if(data.result.verificationStatus === 'verified'){
         const newAddress = {
            userId,
            ...addressForm.data
         }
         await prisma.address.create({
            data: newAddress
         })
      }
      if(data.result.verificationStatus === 'unverified'){
         return message(addressForm, 'Unable to verify address, please contact the office');
      }
      return message(addressForm, 'Address updated')
   }
};