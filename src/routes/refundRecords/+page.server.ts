import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema } from '$lib/formSchemas/dateSearchFormSchema';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(valibot(searchFormSchema));
   const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
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

