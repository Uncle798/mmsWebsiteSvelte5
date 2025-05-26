import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot, zod } from 'sveltekit-superforms/adapters';
import { newInvoiceFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
     }
    const newInvoiceForm = await superValidate(valibot(newInvoiceFormSchema));
    const registerForm = await superValidate(zod(registerFormSchema));
    const customers = await prisma.user.findMany({
        orderBy: {
            familyName: 'asc'
        }
    });
    const leases = await prisma.lease.findMany({
        orderBy: {
            leaseEnded: { 
                sort: 'desc', 
                nulls: 'first'
            }
        }
    })
    return { newInvoiceForm, customers, leases, registerForm };
}) satisfies PageServerLoad;
