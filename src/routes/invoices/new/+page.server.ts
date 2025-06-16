import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema, newInvoiceFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const newInvoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const customerId = event.url.searchParams.get('customerId');
   if(customerId){
      const customer = await prisma.user.findMany({
         where: {
            id: customerId
         }
      })
      const leases = await prisma.lease.findMany({
         where: {
            customerId,
         }
      });
      return { customer, leases, newInvoiceForm, registerForm, emailVerificationForm}
   }
   const customers = await prisma.user.findMany({
      orderBy: {
         familyName: 'asc'
      },
   });
   const leases = await prisma.lease.findMany({
      orderBy: {
         leaseEnded: { 
               sort: 'desc', 
               nulls: 'first'
         }
      }
   })
   return { newInvoiceForm, customers, leases, registerForm, emailVerificationForm };
}) satisfies PageServerLoad;
