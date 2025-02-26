import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate,  } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema, cuidIdFormSchema, emailFormSchema, emailVerificationFormSchema, leaseEndFormSchema, nameFormSchema, } from '$lib/formSchemas/schemas';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const addressPromise = prisma.address.findFirst({
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
   const leaseEndForm = await superValidate(zod(leaseEndFormSchema));
   const autoPayForm = await superValidate(zod(cuidIdFormSchema));
   return { 
      addressForm, 
      nameForm, 
      emailForm, 
      emailVerificationForm,
      leaseEndForm,
      addressPromise, 
      leasesPromise, 
      invoicesPromise, 
      paymentsPromise,
      autoPayForm
   };
})

export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const form = await superValidate(formData, zod(cuidIdFormSchema));
      if(!form.valid){
         return {form}
      }
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: form.data.cuid2Id
         }
      });
      if(lease){
         const invoice = await prisma.invoice.create({
            data: {
               leaseId: lease.leaseId,
               invoiceAmount: lease.price,
               customerId: lease.customerId,
               invoiceNotes: `Auto pay sign up`
            }
         })
         redirect(302, `/makePayment?invoiceNum=${invoice.invoiceNum}&subscription=true`)
      }
   }
};