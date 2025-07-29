import { prisma } from '$lib/server/prisma';
import {error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema, newInvoiceFormSchema, newPaymentRecordFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const newPaymentRecordForm = await superValidate(valibot(newPaymentRecordFormSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const invoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const invoiceNum = event.url.searchParams.get('invoiceNum')
   const userId = event.url.searchParams.get('userId');
   if(invoiceNum){
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: parseInt(invoiceNum, 10)
         }
      })
      if(!invoice){
         error(404, 'Invoice not found');
      }
      const customer = await prisma.user.findUnique({
         where: {
            id: invoice.customerId
         }
      })
      return { invoice, customer, newPaymentRecordForm, registerForm, invoiceForm, emailVerificationForm }
   }
   if(userId){
      const customer = await prisma.user.findUnique({
         where: {
            id:userId
         }
      })
      const customerInvoices = await prisma.invoice.findMany({
         where: {
            AND: [
               { paymentRecordNum: null },
               { customerId: userId }
            ]
         }
      });
      const leases = await prisma.lease.findMany({
         where: {
            customerId: userId
         }
      })
      return {newPaymentRecordForm, registerForm, invoiceForm, emailVerificationForm, customer, customerInvoices, leases, invoiceNum}
   }
   const invoices = await prisma.invoice.findMany({
      where: {
         paymentRecordNum: null
      }
   });
   const leases = await prisma.lease.findMany({
      where: {
         invoices: {
            some: {
               paymentRecordNum: null
            }
         }
      }

   });
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
   return { 
      customers, 
      invoices, 
      newPaymentRecordForm, 
      registerForm, 
      leases, 
      invoiceForm, 
      invoiceNum, 
      emailVerificationForm 
   };
}) satisfies PageServerLoad;