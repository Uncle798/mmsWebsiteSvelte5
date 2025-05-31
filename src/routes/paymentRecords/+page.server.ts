import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot, zod } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, refundFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee&redirectTo=paymentRecords');
   }
   const searchForm = await superValidate(zod(searchFormSchema));
   const dateSearchForm = await superValidate(zod(dateSearchFormSchema));
   const refundForm = await superValidate(valibot(refundFormSchema));
   const paymentRecordCount = await prisma.paymentRecord.count();
   const firstPayment = await prisma.paymentRecord.findFirst({
      orderBy: {
         paymentCreated: 'asc'
      }
   })
   const years = arrayOfYears(firstPayment?.paymentCreated.getFullYear())
   const paymentRecords = prisma.paymentRecord.findMany({
      orderBy: {
         paymentCreated: 'asc'
      },
   });
   const customers = prisma.user.findMany({});
   const addresses = prisma.address.findMany({
      where: {
         softDelete: false
      }
   });
   return { 
      paymentRecords, 
      searchForm, 
      paymentRecordCount, 
      years, 
      customers, 
      dateSearchForm, 
      addresses, 
      refundForm
   };
}) satisfies PageServerLoad;
