import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(zod(searchFormSchema));
    const dateSearchForm = await superValidate(zod(dateSearchFormSchema));
    const paymentRecordCount = await prisma.paymentRecord.count();
    const firstPayment = await prisma.paymentRecord.findFirst({
        orderBy: {
            paymentCreated: 'asc'
        }
    })
    const years = arrayOfYears(firstPayment?.paymentCreated.getFullYear())
    const paymentRecords = prisma.paymentRecord.findMany({
        orderBy: {
            paymentCreated: 'asc'
        },
    });
    const customers = prisma.user.findMany()
    return { paymentRecords, searchForm, paymentRecordCount, years, customers, dateSearchForm };
}) satisfies PageServerLoad;
