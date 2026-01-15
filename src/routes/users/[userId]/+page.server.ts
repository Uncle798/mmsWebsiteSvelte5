import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, } from "./$types";
import { prisma } from "$lib/server/prisma";;
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { leaseEndFormSchema } from "$lib/formSchemas/leaseEndFormSchema";
import { userNotesFormSchema } from "$lib/formSchemas/userNotesFormSchema";
import { emailVerificationFormSchema } from '$lib/formSchemas/emailVerificationFormSchema';
import { addressFormSchema } from '$lib/formSchemas/addressFormSchema';
import { emailFormSchema } from '$lib/formSchemas/emailFormSchema';
import { nameFormSchema } from "$lib/formSchemas/nameFormSchema";
import { onboardingCreateManyInvoicesFormSchema } from "$lib/formSchemas/onboardingCreateManyInvoicesFormSchema";
import { payManyInvoicesFormSchema } from "$lib/formSchemas/payManyInvoicesFormSchema";
import { newInvoiceFormSchema } from "$lib/formSchemas/newInvoiceFormSchema";
import { registerFormSchema } from "$lib/formSchemas/registerFormSchema";
import { newPaymentRecordFormSchema } from "$lib/formSchemas/newPaymentRecordFormSchema";
import { searchFormSchema } from "$lib/formSchemas/searchFormSchema";
import { userSort } from "$lib/utils/userSort";
import { employmentFormSchema } from "$lib/formSchemas/employmentFormSchema";

export const load: PageServerLoad = async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const addressForm = await superValidate(valibot(addressFormSchema));
   const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
   const emailChangeForm = await superValidate(valibot(emailFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const userNotesForm = await superValidate(valibot(userNotesFormSchema));
   const nameChangeForm = await superValidate(valibot(nameFormSchema));
   const onboardingCreateManyInvoicesForm = await superValidate(valibot(onboardingCreateManyInvoicesFormSchema));
   const payManyInvoicesForm = await superValidate(valibot(payManyInvoicesFormSchema));
   const newInvoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const newPaymentRecordForm = await superValidate(valibot(newPaymentRecordFormSchema));
   const searchForm = await superValidate(valibot(searchFormSchema));
   const employmentForm = await superValidate(valibot(employmentFormSchema))
   const userId = event.params.userId;

   const dbUser = await prisma.user.findUnique({
      where: {
         id: userId
      }
   })
   if(dbUser === null){
      error(404, {message:'User not found'})
   }
   const address = await prisma.address.findFirst({
      where: { 
         AND:[
            { userId: userId },
            { softDelete: false }
         ]
      }
   })  
   const leases = prisma.lease.findMany({
      where: {
         customerId: dbUser?.id
      },
      orderBy: {
         leaseEffectiveDate: 'desc'
      }
   })
   const invoices = prisma.invoice.findMany({
      where: {
         customerId: dbUser?.id
      },
      orderBy: {
         invoiceDue: 'desc'
      },
   })
   const paymentRecords = prisma.paymentRecord.findMany({
      where: {
         customerId: dbUser.id
      },
      orderBy: {
         paymentCompleted: 'desc'
      }
   });
   const refunds = prisma.refundRecord.findMany({
      where: {
         customerId: dbUser.id
      },
      orderBy: {
         refundCreated: 'desc'
      }
   });
   let customers = await prisma.user.findMany({
      where: {
         customerLeases:{
            some: {
               leaseEnded: null,
            }
         }
      }
   });
   customers = userSort(customers);
   return { 
      dbUser, 
      address, 
      leases, 
      invoices,
      paymentRecords,
      addressForm, 
      leaseEndForm, 
      userId, 
      refunds, 
      customers,
      nameChangeForm, 
      emailChangeForm, 
      emailVerificationForm, 
      userNotesForm, 
      onboardingCreateManyInvoicesForm,
      payManyInvoicesForm,
      newInvoiceForm,
      registerForm,
      newPaymentRecordForm,
      searchForm,
      employmentForm
   }
};