import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, } from './$types';
import { superValidate,  } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema, emailFormSchema, emailVerificationFormSchema, leaseEndFormSchema, nameFormSchema, passwordFormSchema } from '$lib/formSchemas/schemas';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const addressPromise = prisma.contactInfo.findFirst({
      where: {
         userId: event.locals.user.id,
         softDelete: false
      },

   })
   const leasesPromise = prisma.lease.findMany({
      where: {
         customerId: event.locals.user.id
      }
   });
   const invoicesPromise = prisma.invoice.findMany({
      where: {
         customerId: event.locals.user.id
      }
   });
   const paymentsPromise = prisma.paymentRecord.findMany({
      where: {
         customerId: event.locals.user.id
      }
   })
   const addressForm = await superValidate(zod(addressFormSchema));
   const nameForm = await superValidate(zod(nameFormSchema));
   const emailForm = await superValidate(zod(emailFormSchema));
   const emailVerificationForm = await superValidate(zod(emailVerificationFormSchema));
   const passwordChangeForm = await superValidate(zod(passwordFormSchema));
   const leaseEndForm = await superValidate(zod(leaseEndFormSchema));
   return { 
      addressForm, 
      nameForm, 
      emailForm, 
      emailVerificationForm, 
      passwordChangeForm,
      leaseEndForm,
      addressPromise, 
      leasesPromise, 
      invoicesPromise, 
      paymentsPromise };
})

