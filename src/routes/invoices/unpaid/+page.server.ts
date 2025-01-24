import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(zod(searchFormSchema));
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
   return { invoices, invoiceCount, searchForm };
}) satisfies PageServerLoad;