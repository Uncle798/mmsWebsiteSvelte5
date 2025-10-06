import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate,  } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { addressFormSchema, cuidIdFormSchema, emailFormSchema, emailVerificationFormSchema, leaseEndFormSchema, nameFormSchema, } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';

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
      },
      orderBy: {
         unitNum: 'asc'
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
   const addressForm = await superValidate(valibot(addressFormSchema));
   const nameForm = await superValidate(valibot(nameFormSchema));
   const emailForm = await superValidate(valibot(emailFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
   const autoPayForm = await superValidate(valibot(cuidIdFormSchema));
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
      autoPayForm, 
   };
})

export const actions: Actions = {
   autoPaySignUp: async (event) => {
      const formData = await event.request.formData();
      const form = await superValidate(formData, valibot(cuidIdFormSchema));
      if(!form.valid){
         return {form}
      }
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: form.data.cuid2Id
         }
      });
      if(lease){
         let autoPayFirstDue:Date = new Date();
         const invoice = await prisma.invoice.findFirst({
            where: {
               AND: [
                  { customerId: lease.customerId },
                  { deposit: false },
                  { invoiceAmount: {
                     gt: prisma.invoice.fields.amountPaid
                  }}
               ]
            },
            orderBy: {
               invoiceCreated: 'asc'
            },
         })
         if(invoice){
            autoPayFirstDue = dayjs(invoice.invoiceCreated).add(1, 'month').toDate()
         }
         const autoPayInvoice = await prisma.invoice.create({
            data: {
               customerId: lease.customerId,
               leaseId: lease.leaseId,
               invoiceAmount: lease.price,
               invoiceDue: autoPayFirstDue,
               invoiceNotes: `Auto-payment for unit ${lease.unitNum}`
            }
         })
         redirect(302, `/makePayment?invoiceNum=${autoPayInvoice.invoiceNum}&subscription=true`)
      }
      return { form }
   },
   autoPayCancel: async (event) =>{
      const formData = await event.request.formData();
      const form = await superValidate(formData, valibot(cuidIdFormSchema));
      if(!form.valid){
         return { form };
      }
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: form.data.cuid2Id
         }
      });
      if(lease){
         const response = event.fetch('/api/elavon/cancelRecurring', {
            method: 'POST', 
            body: JSON.stringify({leaseId:form.data.cuid2Id})
         })
      }
   }
};