import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema } from '$lib/formSchemas/dateSearchFormSchema';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee&redirectTo=invoices')
     }
    const searchForm = await superValidate(valibot(searchFormSchema));
    const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
    const invoiceCount = await prisma.invoice.count();
    const firstInvoice = await prisma.invoice.findFirst({
        orderBy: {
            invoiceNum: 'asc'
        }
    })
    if(!firstInvoice){
        error(400)
    }
    const years = arrayOfYears(firstInvoice!.invoiceCreated.getFullYear());

    const invoices = prisma.invoice.findMany({
        orderBy: {
            invoiceCreated: 'asc'
        }
    })
    const customers = prisma.user.findMany();
    const addresses = prisma.address.findMany({
        where:{
            softDelete: false
        }
    })
    return { invoices, invoiceCount, searchForm, years, customers, dateSearchForm, addresses };
}) satisfies PageServerLoad;