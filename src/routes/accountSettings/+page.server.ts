import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate,  } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema, cuidIdFormSchema, emailFormSchema, emailVerificationFormSchema, leaseEndFormSchema, nameFormSchema, } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';
import { stripe } from '$lib/server/stripe';
import type Stripe from 'stripe';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   let stripeAccountSession: Promise<Stripe.BillingPortal.Session> | undefined = undefined;
   if(event.locals.user.stripeId){
      stripeAccountSession = stripe.billingPortal.sessions.create({
         customer: event.locals.user.stripeId!
      })
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
      autoPayForm, 
      stripeAccountSession
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
         let autoPayFirstDue:Date = new Date();
         const invoice = await prisma.invoice.findFirst({
            where: {
               AND: [
                  { customerId: lease.customerId },
                  { deposit: false },
                  { paymentRecordNum: null}
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
               invoiceCreated: autoPayFirstDue,
               invoiceNotes: `Auto-payment for unit ${lease.unitNum}`
            }
         })
         redirect(302, `/makePayment?invoiceNum=${autoPayInvoice.invoiceNum}&subscription=true`)
      }
   }
};