import { prisma } from '$lib/server/prisma';
import {error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { newInvoiceFormSchema } from '$lib/formSchemas/newInvoiceFormSchema';
import { newPaymentRecordFormSchema } from '$lib/formSchemas/newPaymentRecordFormSchema';
import { emailVerificationFormSchema } from '$lib/formSchemas/emailVerificationFormSchema';
import { registerFormSchema } from '$lib/formSchemas/registerFormSchema';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const newPaymentRecordForm = await superValidate(valibot(newPaymentRecordFormSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const invoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   const userId = event.url.searchParams.get('userId');
   const paymentTypesCookie = event.cookies.get('paymentTypes');
   const newPaymentCookie = event.cookies.get('newPayment');
   if(invoiceNum){
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: parseInt(invoiceNum, 10)
         }
      })
      if(!invoice){
         error(404, 'Invoice not found');
      }
      try {
         const customer = await prisma.user.findUniqueOrThrow({
            where: {
               id: invoice.customerId
            }
         })
         const address = await prisma.address.findFirst({
            where: {
               AND: [
                  {userId: customer?.id},
                  {softDelete: false}
               ]
            }
         })
         return { 
            invoice, 
            customer, 
            address, 
            newPaymentRecordForm, 
            registerForm, 
            invoiceForm, 
            emailVerificationForm, 
            paymentTypesCookie, 
            newPaymentCookie 
         }
      } catch (error) {
         console.error(error);
         return {newPaymentRecordForm, registerForm, invoiceForm, emailVerificationForm}
      }
   }
   if(userId){
      const customer = await prisma.user.findUniqueOrThrow({
         where: {
            id:userId
         }
      })
      const invoices = await prisma.invoice.findMany({
         where: {
            AND: [
               { invoiceAmount: {
                  gt: prisma.invoice.fields.amountPaid
               }},
               { customerId: userId }
            ]
         }
      });
      const leases = await prisma.lease.findMany({
         where: {
            customerId: userId
         }
      })
      return {
         newPaymentRecordForm, 
         registerForm, 
         invoiceForm, 
         emailVerificationForm, 
         customer, 
         invoices, 
         leases, 
         invoiceNum, 
         paymentTypesCookie, 
         newPaymentCookie
      }
   }
   const invoices = await prisma.invoice.findMany({
      where: {
         invoiceAmount: {
            gt: prisma.invoice.fields.amountPaid
         }
      }
   });
   const leases = await prisma.lease.findMany({
      where: {
         invoices: {
            some: {
               invoiceAmount: {
                  gt: prisma.invoice.fields.amountPaid
               }
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
                     invoiceAmount: {
                        gt: prisma.invoice.fields.amountPaid
                     }
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
      emailVerificationForm,
      paymentTypesCookie,
      newPaymentCookie
   };
}) satisfies PageServerLoad;