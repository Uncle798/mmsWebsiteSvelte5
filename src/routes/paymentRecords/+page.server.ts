import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import type { Actions } from '@sveltejs/kit';
import dayjs from 'dayjs';

export const load = (async (event) => {
    const paymentRecords = await prisma.paymentRecord.findMany({
        include: {
            customer: true
        },
        orderBy: {
            paymentCompleted: 'desc'
        },
        where: {
            paymentCreated: {
                gte: dayjs(Date.now()).subtract(1, 'year').toDate()
            }
        }, 
    });
    return { paymentRecords, };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
       const formData = await event.request.formData();
       const searchForm = await superValidate(formData, zod(searchFormSchema));
       return {searchForm}
    }
 };