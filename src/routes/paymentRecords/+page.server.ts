import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
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
    const paymentRecords = await prisma.paymentRecord.findMany({
        orderBy: {
            paymentCompleted: 'desc'
        },
        where: {
            paymentCreated: {
                gte: dayjs(Date.now()).subtract(1, 'year').toDate()
            }
        }, 
        include: {
            customer: true
        }
    });
    console.log('paymentRecord: ', paymentRecords[0])
    return { paymentRecords, searchForm, };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
       const formData = await event.request.formData();
       const searchForm = await superValidate(formData, zod(searchFormSchema));
       return {searchForm}
    }
 };