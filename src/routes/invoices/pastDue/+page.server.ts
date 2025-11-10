import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema } from '$lib/formSchemas/dateSearchFormSchema';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(valibot(searchFormSchema));
   const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
   const invoiceCount = await prisma.invoice.count({
      where: {
         AND: [
            { invoiceAmount: {
               gt: prisma.invoice.fields.amountPaid
            }},
            {invoiceDue: {
               lte: new Date()
            }},
            {deposit: false}
         ]
      },
   })
   const invoices = prisma.invoice.findMany({
      where: {
         AND: [
            {
               invoiceAmount: {
                  gt: prisma.invoice.fields.amountPaid
               }
            },
            {
               invoiceDue: {
                  lte: new Date()
               }
            },
            {
               deposit: false
            }
         ]
      }
   })
   const customers = prisma.user.findMany({
      where: {
         AND: [
            {
               archive: false
            },
            {
               customerInvoices: {
                  some: {
                     AND: [
                        {
                           invoiceAmount: {
                              gt: prisma.invoice.fields.amountPaid
                           }
                        },
                        {
                           invoiceDue: {
                              lte: new Date()
                           }
                        },
                        {
                           deposit: false
                        }
                     ]
                  }
               }
            }
         ]
      }
   });
   const addresses = prisma.address.findMany({
      where: {
         AND: [
            {
               softDelete: false
            },
            {
               user: {
                  customerInvoices: {
                     some: {
                        AND: [
                           {
                              invoiceAmount: {
                                 gt: prisma.invoice.fields.amountPaid
                              }
                           },
                           {
                              invoiceDue: {
                                 lte: new Date()
                              }
                           },
                           {
                              deposit: false
                           }
                        ]
                     }
                  }
               }
            }
         ]
      }
   })
   return { invoices, invoiceCount, searchForm, customers, addresses, dateSearchForm };

}) satisfies PageServerLoad;