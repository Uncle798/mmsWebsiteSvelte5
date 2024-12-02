import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import type { Actions } from '@sveltejs/kit';

export const load = (async (event) => {
    const search = event.url.searchParams.get('search');
    const paymentSearchForm = await superValidate(zod(searchFormSchema));
    const customers = await prisma.user.findMany();
    
    if(search) {
        const paymentRecords = await prisma.paymentRecord.findMany({
            include: {
                customer: true,
            },
            orderBy: {
                paymentCompleted: 'desc'
            },
            where: {
                OR:[
                    { paymentNumber: {
                        equals: parseInt(search, 10)
                    }}
                ]
            }
        })
        return { paymentRecords, paymentSearchForm, customers }
    }
    const paymentRecords = await prisma.paymentRecord.findMany({
        include: {
            customer: true
        },
        orderBy: {
            paymentCompleted: 'desc'
        }
    });
    return { paymentRecords, paymentSearchForm, customers };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
       const formData = await event.request.formData();
       const searchForm = await superValidate(formData, zod(searchFormSchema));
       return {searchForm}
    }
 };