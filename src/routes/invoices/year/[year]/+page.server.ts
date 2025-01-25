import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import dayjs from 'dayjs';
import { prisma } from '$lib/server/prisma';
import { arrayOfMonthNames } from '$lib/server/utils';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
    }
    const year = event.params.year;
    const searchForm = await superValidate(zod(searchFormSchema));
    const startDate = dayjs(`${year}-01-01 00:00`).toDate();
    const endDate = dayjs(`${year}-12-31 23:59`).toDate();
    const invoices = prisma.invoice.findMany({
        where: {
            AND: [
                { invoiceCreated: { gt: startDate } },
                { invoiceCreated: { lt: endDate } }
            ]
        },
        orderBy: {
            invoiceNum: 'desc'
        }
    })
    const invoiceCount = await prisma.invoice.count({
        where: {
            AND: [
                { invoiceCreated: { gt: startDate } },
                { invoiceCreated: { lt: endDate } }
            ]
        }
    })
    const months = arrayOfMonthNames();
    const customers = prisma.user.findMany();
    return { invoices, invoiceCount, months, customers, searchForm };
}) satisfies PageServerLoad;