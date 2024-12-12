import { prisma } from '$lib/server/prisma';
import {redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newPaymentRecordFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';

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
   })
   const newPaymentRecordForm = await superValidate(zod(newPaymentRecordFormSchema));
   const registerForm = await superValidate(zod(registerFormSchema));
    return { customers, invoices, newPaymentRecordForm, registerForm };
}) satisfies PageServerLoad;