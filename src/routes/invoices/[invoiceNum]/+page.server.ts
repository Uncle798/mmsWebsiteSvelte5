import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   const invoiceNum = event.params.invoiceNum;
   if(!invoiceNum){
      fail(404);
   }
   if(!event.locals.user){
      redirect(302, `/login?toast=unauthorized&redirectTo=invoice&invoiceNum=${invoiceNum}`)
   }
   if(invoiceNum){
      if(event.locals.user.employee){
         const invoice = await prisma.invoice.findFirst({
            where: {
               invoiceNum:parseInt(invoiceNum, 10),
            },
         })
         if(!invoice){
            fail(404)
         }
         const customer = await prisma.user.findFirst({
            where: {
               id: invoice!.customerId!
            }
         })
         const address = await prisma.address.findFirst({
            where: {
               userId: invoice!.customerId!
            }
         })
          return { invoice, address, customer };
         } else {
            const invoice = await prisma.invoice.findFirst({
               where: {
                  invoiceNum:parseInt(invoiceNum, 10),
               },
            })
            if(!invoice){
               fail(404)
            }
            if(invoice?.customerId !== event.locals.user.id){
               fail(400);
            }
            const customer = await prisma.user.findFirst({
               where: {
                  id: invoice!.customerId!
               }
            })
            const address = await prisma.address.findFirst({
               where: {
                  userId: invoice!.customerId!
               }
            })
             return { invoice, address, customer };   
      }
   }
}) satisfies PageServerLoad;