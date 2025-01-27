import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { arrayOfMonths } from '$lib/server/utils';

dayjs.extend(utc)

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(zod(searchFormSchema));
    const year = event.params.year;
    const startDate = dayjs.utc(year).startOf('year').toDate();
    const endDate = dayjs.utc(year).endOf('year').toDate();
    const paymentRecordCount = await prisma.paymentRecord.count({
      where: {
         AND:[
           { paymentCompleted: {gt: startDate} },
           { paymentCompleted: {lt: endDate} }
         ]  
      }
    });
    const paymentRecords = prisma.paymentRecord.findMany({
         orderBy: {
               paymentNumber: 'asc'
         },
         where: {
             AND:[
               { paymentCompleted: {gt: startDate} },
               { paymentCompleted: {lt: endDate} }
             ]  
         },
         include: {
               customer: true
         }
    });
    const customers = prisma.user.findMany()
    const months = arrayOfMonths(startDate, endDate);
    return { paymentRecords, searchForm, paymentRecordCount, customers, months };
}) satisfies PageServerLoad;
