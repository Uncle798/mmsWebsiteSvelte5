import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema } from '$lib/formSchemas/dateSearchFormSchema';
import { refundFormSchema } from '$lib/formSchemas/refundFormSchema';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';
import { redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { arrayOfMonths, arrayOfYears } from '$lib/server/utils';

dayjs.extend(utc)

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(valibot(searchFormSchema));
    const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
    const refundForm = await superValidate(valibot(refundFormSchema));
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
               paymentCreated: 'desc'
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
    const months = arrayOfMonths(startDate, endDate);
    const firstPayment = await prisma.paymentRecord.findFirst({
      orderBy: {
        paymentCreated: 'asc'
      }
    })
    const years = arrayOfYears(firstPayment?.paymentCreated.getFullYear())
    return { paymentRecords, searchForm, paymentRecordCount, customers, months, dateSearchForm, addresses, refundForm, year, years };
}) satisfies PageServerLoad;
