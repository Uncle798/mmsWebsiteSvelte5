import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema, emailFormSchema, emailVerificationFormSchema, nameFormSchema } from '$lib/formSchemas/schemas';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   if(event.locals.user.employee){
      const userId = event.params.userId;
      if(!userId){
         fail(404);
      }
      const dbUser = await prisma.user.findFirst({
         where: {
            id: userId
         }
      })
      const address = prisma.contactInfo.findFirst({
         where: {
            userId: dbUser?.id
         }
      })
      const leases = prisma.lease.findMany({
         where: {
            customerId: dbUser?.id
         }
      });
      const invoices = prisma.invoice.findMany({
         where: {
            customerId: dbUser?.id
         }
      });
      const payments = prisma.paymentRecord.findMany({
         where: {
            customerId: dbUser?.id
         }
      })
      return { dbUser, address, leases, invoices, payments }
   }
   const address = await prisma.contactInfo.findFirst({
      where: {
         userId: event.locals.user.id,
         softDelete: false
      },

   })
   const addressForm = await superValidate(zod(addressFormSchema));
   const nameForm = await superValidate(zod(nameFormSchema));
   const emailForm = await superValidate(zod(emailFormSchema));
   const emailVerificationForm = await superValidate(zod(emailVerificationFormSchema));
   return { addressForm, nameForm, emailForm, emailVerificationForm, address };
})


export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const addressForm = await superValidate(formData, zod(addressFormSchema));
      return message(addressForm, 'Address updated')
   }
};