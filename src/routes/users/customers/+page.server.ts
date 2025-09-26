import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { searchFormSchema, userNotesFormSchema } from '$lib/formSchemas/schemas';
import { invoice } from '../../../../drizzle/schema';
import { and, eq, lt } from 'drizzle-orm';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const userSearchForm = await superValidate(valibot(searchFormSchema));
   const userNotesForm = await superValidate(valibot(userNotesFormSchema));
   const customerCount = await prisma.user.count({
      where: {
         customerLeases: {
            some: {
               leaseEnded: null
            }
         }
      }
   })
   const customers = prisma.user.findMany({
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
                     amountPaid: {
                        lt: prisma.invoice.fields.invoiceAmount
                     }
                  }
               }
            }
         ]
      },
      orderBy: {
         familyName: 'asc'
      }
   });
   const leases = prisma.lease.findMany({
      where: {
         leaseEnded: null,
      },
      orderBy: {
         unitNum: 'asc'
      }
   })
   const addresses = prisma.address.findMany({
      where: {
         user: {
            customerLeases: {
               some: {
                  leaseEnded: null,
               }
            }
         }
      }
   })
   const invoices = prisma.invoice.findMany({
      where: {
         invoiceAmount: {
            gt: prisma.invoice.fields.amountPaid
         }
      }
   })
   const paymentRecords = prisma.paymentRecord.findMany({
      where: {
         AND: [
            {
               customer: {
                  customerLeases: {
                     some: {
                        leaseEnded: null
                     }
                  }
               }
            },
            {
               deposit: false
            }
         ]
      }
   })
   return { customers, leases, userSearchForm, customerCount, addresses, invoices, paymentRecords, userNotesForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const searchForm = await superValidate(formData, valibot(searchFormSchema));
      return {searchForm}
   }
};