import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(zod(searchFormSchema));
   const dateSearchForm = await superValidate(zod(dateSearchFormSchema));
   const refundCount = await prisma.refundRecord.count();
   const refunds = prisma.refundRecord.findMany({
      orderBy: {
         refundCompleted: {
            sort: 'desc',
            nulls: 'first'
         }
      },
   })
   const customers = prisma.user.findMany();
   const addresses = prisma.address.findMany();
   const firstRefund = await prisma.refundRecord.findFirst({
      orderBy: {
         refundCreated: 'asc'
      }
   })
   const years = arrayOfYears(firstRefund?.refundCreated.getFullYear())
   return { refunds, searchForm, refundCount, customers, years, dateSearchForm, addresses };
}) satisfies PageServerLoad;

