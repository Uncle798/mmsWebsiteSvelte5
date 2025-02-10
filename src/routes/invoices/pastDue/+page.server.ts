import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(zod(searchFormSchema));
   const dateSearchForm = await superValidate(zod(dateSearchFormSchema));
   const invoiceCount = await prisma.invoice.count({
      where: {
         AND: [
            {paymentRecordNum: null},
            {invoiceCreated: {
               lte: dayjs().subtract(1, 'month').toDate()
            }}
         ]
      }
   })
   const invoices = prisma.invoice.findMany({
      where: {
         AND: [
            {paymentRecordNum: null},
            {invoiceCreated: {
               lte: dayjs().subtract(1, 'month').toDate()
            }}
         ]
      },
      orderBy: {
         invoiceNum:'asc'
      }
   })
   const customers = prisma.user.findMany();
   const addresses = prisma.address.findMany({
      where: {
         softDelete: false
      }
   })
   return { invoices, invoiceCount, searchForm, customers, addresses, dateSearchForm };
}) satisfies PageServerLoad;