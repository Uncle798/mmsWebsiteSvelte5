import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const invoices = await prisma.invoice.findMany({
      where: {
         invoiceCreated: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 59))
         }
      }
   });
   const customers = await prisma.user.findMany({
      where: {
         customerInvoices: {
            some: {
               invoiceCreated: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lte: new Date(new Date().setHours(23, 59, 59, 59))
               }
            }
         }
      }
   });
   const addresses = await prisma.address.findMany({
      where: {
         AND: [
            {  
               user: {
                  customerInvoices: {
                     some: {
                        invoiceCreated: {
                           gte: new Date(new Date().setHours(0, 0, 0, 0)),
                           lte: new Date(new Date().setHours(23, 59, 59, 59))
                        }
                     }
                  }
               }
            },
            {
               softDelete: false,
            }
         ]
      }
   })
   return { invoices, customers, addresses, };
}) satisfies PageServerLoad;