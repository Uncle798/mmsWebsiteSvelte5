import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import dayjs from 'dayjs';
import { prisma } from '$lib/server/prisma';
import { arrayOfMonthNames } from '$lib/server/utils';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
    }
    const year = event.params.year;
    const startDate = dayjs(`${year}-01-01 00:00`).toDate();
    const endDate = dayjs(`${year}-12-31 23:59`).toDate();
    const invoices = prisma.invoice.findMany({
        where: {
            AND: [
                { invoiceCreated: { gt: startDate } },
                { invoiceCreated: { lt: endDate } }
            ]
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
    return { invoices, invoiceCount, months };
}) satisfies PageServerLoad;