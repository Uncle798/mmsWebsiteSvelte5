import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema, nameFormSchema } from '$lib/formSchemas/schemas';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const addressForm = await superValidate(zod(addressFormSchema));
   const nameForm = await superValidate(zod(nameFormSchema));
   const address = await prisma.contactInfo.findFirst({
      where: {
         userId: event.locals.user.id,
         softDelete: false
      },

   })
   return { addressForm, nameForm, address };
})


export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, zod(addressFormSchema));
      console.log(addressForm.data);
      return message(addressForm, 'Address updated')
   }
};