import { prisma } from '$lib/server/prisma';
import { message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(zod(searchFormSchema));
    const paymentCount = await prisma.paymentRecord.count();
    const paymentRecords = prisma.paymentRecord.findMany({
        orderBy: {
            paymentNumber: 'desc'
        },
        include: {
            customer: true
        }
    });
    return { paymentRecords, searchForm, paymentCount, };
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