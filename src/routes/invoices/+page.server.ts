import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
     }
    const searchForm = await superValidate(zod(searchFormSchema));
    const invoiceCount = await prisma.invoice.count();
    const firstInvoice = await prisma.invoice.findFirst({
        orderBy: {
            invoiceNum: 'asc'
        }
    })
    const years = arrayOfYears(firstInvoice!.invoiceCreated.getFullYear());

    const invoices = prisma.invoice.findMany({
        include: {
            customer: true
        },
        orderBy: {
            invoiceCreated: 'asc'
        }
    })
    const customers = prisma.user.findMany()
    return { invoices, invoiceCount, searchForm, years, customers };
}) satisfies PageServerLoad;