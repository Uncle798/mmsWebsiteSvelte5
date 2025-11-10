import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema } from '$lib/formSchemas/dateSearchFormSchema';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';

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
      error(404)
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
   const customers = prisma.user.findMany({
      where: {
         customerInvoices: {
            some: {
               AND:[
                  {invoiceCreated: {
                     gte: startDate
                  }},
                  { invoiceCreated: {
                     lt: endDate
                  }},
               ]
            }
         }
      }
   });
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
   const addresses = prisma.address.findMany({
      where:{
         AND: [
            { softDelete: false },
            { user: {
               customerInvoices: {
                  some: {
                     AND:[
                        {invoiceCreated: {
                           gte: startDate
                        }},
                        { invoiceCreated: {
                           lt: endDate
                        }},
                     ]
                  }
               }
            }}
         ]
      }
   })
   const searchForm = await superValidate(valibot(searchFormSchema));
   const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
   return { invoices, customers, addresses, invoiceCount, searchForm, dateSearchForm };
}) satisfies PageServerLoad;
