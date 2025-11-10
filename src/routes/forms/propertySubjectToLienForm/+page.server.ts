import { message, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { propertySubjectToLienSchema } from '$lib/formSchemas/propertySubjectToLienSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';


export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const propertySubjectToLienForm = await superValidate(formData, valibot(propertySubjectToLienSchema));
      console.log(propertySubjectToLienForm);
      if(!propertySubjectToLienForm.valid){
         return message(propertySubjectToLienForm, 'Form not valid');
      }
      const { success, reset } = await ratelimit.customerForm.limit(event.locals.user?.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(propertySubjectToLienForm, `Please wait ${timeRemaining} seconds before trying again`)
      }
      const { data } = propertySubjectToLienForm;
      const user = await prisma.user.create({
         data: {
            givenName: data.givenName,
            familyName: data.familyName,
            email: data.email,
            organizationName: data.organizationName,
         }
      });
      const address = await prisma.address.create({
         data: {
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            state: data.state, 
            country: data.country,
            postalCode: data.postalCode,
            phoneNum1: data.phoneNum1,
            phoneNum1Country: data.phoneNum1Country,
            phoneNum1Validated: false,
            userId: user.id
         }
      })
      const property = await prisma.propertyWithLien.create({
         data:{
            descriptionOfProperty: data.description,
            userId: user.id,
            addressId: address.addressId,
            leaseId: data.leaseId
         }
      })
      const redirectTo = event.url.searchParams.get('redirectTo');
      const leaseId = event.url.searchParams.get('leaseId');
      const userId = event.url.searchParams.get('userId');
      const addressId = event.url.searchParams.get('addressId');
      if(redirectTo){
         redirect(303, `/${redirectTo}?leaseId=${leaseId}&userId=${userId}&addressId=${addressId}&propertyId=${property.id}`)

      }
   }
};