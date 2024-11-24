import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load:PageServerLoad = (async () => {
   const addressForm = await superValidate(zod(addressFormSchema));

   return { addressForm, };
})

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, zod(addressFormSchema));
      const { success, reset } = await ratelimit.register.limit(event.locals.user.id)
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(addressForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const oldAddress = await prisma.contactInfo.findFirst({
         where: {
            userId: event.locals.user.id,
            softDelete: false
         }
      });
      if(oldAddress){
         await prisma.contactInfo.update({
            where:{
               contactId: oldAddress.contactId
            },
            data: {
               softDelete: true,
            }
         })
      }
      const newAddress = {
         userId: event.locals.user.id,
         ...addressForm.data
      }
      await prisma.contactInfo.create({
         data: newAddress
      })

      return message(addressForm, 'Address updated')
   }
};