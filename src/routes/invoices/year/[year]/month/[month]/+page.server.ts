import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';

dayjs.extend(utc)

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const year = event.params.year;
   const month = event.params.month;
   let monthWithLeadingZero:string = month;
   while (monthWithLeadingZero.length < 2) {
      monthWithLeadingZero = '0'+ monthWithLeadingZero
   }
   if(parseInt(monthWithLeadingZero, 10) > 12) {
      fail(404)
   }
   const startDate = dayjs.utc(`${year}-${monthWithLeadingZero}`).startOf('month').toDate()
   const endDate = dayjs.utc(`${year}-${monthWithLeadingZero}`).endOf('month').toDate()
   const invoices = prisma.invoice.findMany({
      where: {
         AND:[
            {invoiceCreated: {
               gte: startDate
            }},
            { invoiceCreated: {
               lt: endDate
            }},
         ]
      }
   })
   const customers = prisma.user.findMany();
   const invoiceCount = await prisma.invoice.count({
      where: {
         AND:[
            {invoiceCreated: {
               gte: startDate
            }},
            { invoiceCreated: {
               lt: endDate
            }},
         ]
      }
   })
   const searchForm = await superValidate(zod(searchFormSchema));
   const dateSearchForm = await superValidate(zod(dateSearchFormSchema));
   return { invoices, customers, invoiceCount, searchForm, dateSearchForm };
}) satisfies PageServerLoad;
