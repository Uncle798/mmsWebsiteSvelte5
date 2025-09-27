import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, } from "./$types";
import { prisma } from "$lib/server/prisma";;
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { addressFormSchema, emailFormSchema, emailVerificationFormSchema, leaseEndFormSchema, userNotesFormSchema } from "$lib/formSchemas/schemas";
export const load: PageServerLoad = async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const addressForm = await superValidate(valibot(addressFormSchema));
   const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
   const emailChangeForm = await superValidate(valibot(emailFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const userNotesForm = await superValidate(valibot(userNotesFormSchema));
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
         invoiceCreated: 'desc'
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
   })
   return { dbUser, address, leases, invoices, paymentRecords, addressForm, leaseEndForm, refunds, emailChangeForm, emailVerificationForm, userNotesForm }
};