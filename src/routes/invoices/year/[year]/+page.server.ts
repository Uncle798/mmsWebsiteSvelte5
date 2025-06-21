import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { prisma } from '$lib/server/prisma';
import { arrayOfMonths } from '$lib/server/utils';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';

dayjs.extend(utc)
export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
    }
    const year = event.params.year;
    const searchForm = await superValidate(valibot(searchFormSchema));
    const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
    const startDate = dayjs.utc(year).startOf('year').toDate();
    const endDate = dayjs.utc(year).endOf('year').toDate();
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
    const months = arrayOfMonths(startDate, endDate);
    const customers = prisma.user.findMany({
        where: {
            customerInvoices: {
                some: {
                    AND: [
                        { invoiceCreated: {gt: startDate} },
                        { invoiceCreated: {lt: endDate} }
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
                    customerInvoices: {
                        some: {
                            AND: [
                                { invoiceCreated: {gt: startDate} },
                                { invoiceCreated: {lt: endDate} },
                            ]
                        }
                    }
                }},
            ]
        }
    })
    return { invoices, invoiceCount, months, customers, searchForm, dateSearchForm, addresses, year };
}) satisfies PageServerLoad;