import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';
import { prisma } from '$lib/server/prisma';
import { arrayOfMonthNames } from '$lib/server/utils';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const year = event.params.year
   const searchForm = await superValidate(zod(searchFormSchema));
   const startDate = dayjs(`${year}-01-01 00:00`).toDate();
   const endDate = dayjs(`${year}-12-31 23:59`).toDate();
   const refunds = prisma.refundRecord.findMany({
      where: {
         AND:[
            { refundCreated: {gt: startDate } },
            { refundCompleted: {lt: endDate } },
         ]
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
   const months = arrayOfMonthNames()
   return { refunds, refundCount, customers, months, searchForm };
}) satisfies PageServerLoad;