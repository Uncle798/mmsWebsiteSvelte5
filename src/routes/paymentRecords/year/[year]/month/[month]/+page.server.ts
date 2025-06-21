import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, refundFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(valibot(searchFormSchema));
    const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
    const refundForm = await superValidate(valibot(refundFormSchema));
    const year = event.params.year;
    const month = event.params.month;
    const startDate = dayjs.utc(`${year}-${month}`).startOf('month').toDate();
    const endDate = dayjs.utc(`${year}-${month}`).endOf('month').toDate();
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
    });
    const customers = prisma.user.findMany({
      where: {
        paymentMade: {
          some: {
            AND:[
              { paymentCompleted: {gt: startDate} },
              { paymentCompleted: {lt: endDate} }
            ]
          }
        }
      }
    });
    const addresses = prisma.address.findMany({
      where: {
        AND: [
          {softDelete: false},
          {user: {
            paymentMade: {
              some: {
                AND:[
                  { paymentCompleted: {gt: startDate} },
                  { paymentCompleted: {lt: endDate} }
                ]
              }
            }
          }}
        ]
      }
    });
    return { paymentRecords, searchForm, paymentRecordCount, customers, dateSearchForm, addresses, refundForm };
}) satisfies PageServerLoad;
