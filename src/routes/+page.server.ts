import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './users/[userId]/$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema } from '$lib/formSchemas/schemas';
import type { PartialContactInfo } from '$lib/server/partialTypes';

const address:PartialContactInfo = {
   address1: '555 N Main',
   city: 'Anytown',
   state: 'ID',
   zip: '83838',
   country: 'US',
   phoneNum1: '2085556789',
   phoneNum1Country: 'US',
   userId: 'dfjdfsjkldsfjlksdf'
}

export const load:PageServerLoad = (async (event) => {
   const addressForm = await superValidate(zod(addressFormSchema));

   return { addressForm, address };
})


export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, zod(addressFormSchema));
      address.address1 = addressForm.data.address1;
      address.city = addressForm.data.city;
      address.state = addressForm.data.state;
      address.zip = addressForm.data.zip;
      address.country = addressForm.data.country;
      return message(addressForm, 'Address updated')
   }
};