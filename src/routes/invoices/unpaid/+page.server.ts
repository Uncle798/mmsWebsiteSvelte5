import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(valibot(searchFormSchema));
   const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
   const invoiceCount = await prisma.invoice.count({
      where: {
         paymentRecordNum: null
      }
   })
   const invoices = prisma.invoice.findMany({
      where: {
         paymentRecordNum: null
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