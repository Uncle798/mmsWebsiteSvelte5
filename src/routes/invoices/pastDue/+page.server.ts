import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { invoice } from '../../../../drizzle/schema'
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import { gte, and, lte, lt, eq } from 'drizzle-orm';

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
         archive: false
      }
   });
   const addresses = prisma.address.findMany({
      where: {
         softDelete: false
      }
   })
   return { invoices, invoiceCount, searchForm, customers, addresses, dateSearchForm };

}) satisfies PageServerLoad;