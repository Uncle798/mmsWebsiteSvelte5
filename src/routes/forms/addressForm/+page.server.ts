import { superValidate, message } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load:PageServerLoad = (async () => {
   const addressForm = await superValidate(zod(addressFormSchema));
   console.log(addressForm);
   return { addressForm, };
})

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, zod(addressFormSchema));
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