import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee');
    }
    const searchForm = await superValidate(zod(searchFormSchema));
    const year = event.params.year;
    const start = dayjs(`${year}-01-01 00:00`).toDate();
    const end = dayjs(`${year}-12-31 23:59`).toDate();
    const paymentRecordCount = await prisma.paymentRecord.count({
      where: {
         AND:[
           { paymentCompleted: {gt: start} },
           { paymentCompleted: {lt: end} }
         ]  
      }
    });
    const paymentRecords = prisma.paymentRecord.findMany({
         orderBy: {
               paymentNumber: 'asc'
         },
         where: {
             AND:[
               { paymentCompleted: {gt: start} },
               { paymentCompleted: {lt: end} }
             ]  
         },
         include: {
               customer: true
         }
    });
    return { paymentRecords, searchForm, paymentRecordCount };
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