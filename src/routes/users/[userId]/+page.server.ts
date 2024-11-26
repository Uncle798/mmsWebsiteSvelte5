import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, } from "./$types";
import { prisma } from "$lib/server/prisma";;
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { addressFormSchema, leaseEndFormSchema } from "$lib/formSchemas/schemas";
export const load: PageServerLoad = async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const addressForm = await superValidate(zod(addressFormSchema));
   const leaseEndForm = await superValidate(zod(leaseEndFormSchema))
   const userId = event.params.userId;

   const dbUser = await prisma.user.findFirst({
      where: {
         id: userId
      }
   })
   if(dbUser === null){
      error(404, {message:'User not found'})
   }
   const address = await prisma.contactInfo.findFirst({
      where: { 
         AND:[
            { userId: userId },
            { softDelete: false }
         ]
      }
   })
   
   const leases = await prisma.lease.findMany({
      where: {
         customerId: dbUser?.id
      },
      orderBy: {
         leaseEffectiveDate: 'desc'
      }
   })
   const invoices = await prisma.invoice.findMany({
      where: {
         customerId: dbUser?.id
      },
      orderBy: {
         invoiceCreated: 'desc'
      }
   })
   const payments = await prisma.paymentRecord.findMany({
      where: {
         customerId: dbUser.id
      },
      orderBy: {
         paymentCompleted: 'desc'
      }
   })
   return { dbUser, address, leases, invoices, payments, addressForm, leaseEndForm, }
};