import { prisma } from '$lib/server/prisma';
import { message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import type { Actions } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(zod(searchFormSchema));
    const search = event.url.searchParams.get('search');
    const leaseId = event.url.searchParams.get('leaseId');
    const paymentRecords = await prisma.paymentRecord.findMany({
        orderBy: {
            paymentNumber: 'asc'
        },
        // where: {
        //     paymentCreated: {
        //         gte: dayjs(Date.now()).subtract(1, 'year').toDate()
        //     }
        // }, 
        include: {
            customer: true
        }
    });
    if(search){
        const paymentRecord = await prisma.paymentRecord.findUnique({
            where: {
                paymentNumber: parseInt(search, 10),
            }
        })
        if(!paymentRecord){
            message(searchForm, 'Record not found');
            return { paymentRecords, searchForm }
        }
        redirect(302, `/paymentRecords/${paymentRecord?.paymentNumber}`)
    }
    return { paymentRecords, searchForm, leaseId, };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        if(!event.locals.user?.employee){
            redirect(302, '/login?toast=employee');
        }
        const formData = await event.request.formData();
        const searchForm = await superValidate(formData, zod(searchFormSchema));
        return {searchForm}
    }
 };