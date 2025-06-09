import { prisma } from '$lib/server/prisma';
import {redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot, zod } from 'sveltekit-superforms/adapters';
import { newInvoiceFormSchema, newPaymentRecordFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';

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
   const registerForm = await superValidate(zod(registerFormSchema));
   const invoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   let defaultCustomer = event.url.searchParams.get('defaultCustomer');
   let defaultInvoice = event.url.searchParams.get('defaultInvoice');
   if(!defaultCustomer){
      defaultCustomer = ''
   }
   if(!defaultInvoice){
      defaultInvoice = ''
   }
   return { customers, invoices, newPaymentRecordForm, registerForm, leases, invoiceForm, defaultCustomer, defaultInvoice };
}) satisfies PageServerLoad;