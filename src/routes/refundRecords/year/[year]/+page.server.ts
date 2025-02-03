import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { prisma } from '$lib/server/prisma';
import { arrayOfMonths } from '$lib/server/utils';
dayjs.extend(utc)

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const year = event.params.year
   const searchForm = await superValidate(zod(searchFormSchema));
   const dateSearchForm = await superValidate(zod(dateSearchFormSchema));
   const startDate = dayjs.utc(year).startOf('year').toDate();
   const endDate = dayjs.utc(year).endOf('year').toDate();
   const refunds = prisma.refundRecord.findMany({
      where: {
         AND:[
            { refundCreated: {gt: startDate } },
            { refundCompleted: {lt: endDate } },
         ]
      },
      orderBy: {
         refundCreated: 'asc'
      }
   })
   const refundCount = await prisma.refundRecord.count({
      where: {
         AND:[
            { refundCreated: {gt: startDate } },
            { refundCompleted: {lt: endDate } },
         ]
      }
   })
   const customers = prisma.user.findMany();
   const months = arrayOfMonths(startDate, endDate)
   return { refunds, refundCount, customers, months, searchForm, dateSearchForm };
}) satisfies PageServerLoad;