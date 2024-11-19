import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
export const load: PageServerLoad = async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const userId = event.params.userId;
   const dbUser = await prisma.user.findFirst({
      where: {
         id: userId
      }
   })
   if(dbUser === null){
      error(404, {message:'User not found'})
   }
   const addressPromise = prisma.contactInfo.findFirst({
      where: {
         userId: dbUser?.id,
         softDelete: false
      }
   })
   const leasesPromise = prisma.lease.findMany({
      where: {
         customerId: dbUser?.id
      }
   })
   const invoicesPromise = prisma.invoice.findMany({
      where: {
         customerId: dbUser?.id
      }
   })
   const paymentsPromise = prisma.paymentRecord.findMany({
      where: {
         customerId: dbUser.id
      }
   })
   return { dbUser, addressPromise, leasesPromise, invoicesPromise, paymentsPromise}
};