import { prisma } from '$lib/server/prisma';
import {redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema, newInvoiceFormSchema, newPaymentRecordFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const customers = await prisma.user.findMany({
      where: {
         OR:[
            {
               customerLeases: {
                  some: {
                     leaseEnded: null
                  }
               }
            },
            {
               customerInvoices: {
                  some: {
                     paymentRecordNum: null
                  }
               }
            }
         ]
      },
      orderBy: [
         {familyName: 'asc'}, 
         {givenName: 'asc'}
      ],
   })
   const invoices = await prisma.invoice.findMany({
      where: {
         paymentRecordNum: null
      }
   });
   const leases = await prisma.lease.findMany({})
   const newPaymentRecordForm = await superValidate(valibot(newPaymentRecordFormSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const invoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   let defaultCustomer = event.url.searchParams.get('defaultCustomer');
   let defaultInvoice = event.url.searchParams.get('defaultInvoice');
   const userId = event.url.searchParams.get('userId');
   if(userId){
      defaultCustomer = userId
   }
   return { 
      customers, 
      invoices, 
      newPaymentRecordForm, 
      registerForm, 
      leases, 
      invoiceForm, 
      defaultCustomer, 
      defaultInvoice, 
      emailVerificationForm 
   };
}) satisfies PageServerLoad;