import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { newInvoiceFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {
    const newInvoiceForm = await superValidate(zod(newInvoiceFormSchema));
    const customers = await prisma.user.findMany({
        orderBy: {
            familyName: 'asc'
        }
    })
    return { newInvoiceForm, customers };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) =>{
        if(!event.locals.user?.employee){
            redirect(302, '/login?toast=employee');
        }
        const formData = await event.request.formData();
        const newInvoiceForm = await superValidate(formData, zod(newInvoiceFormSchema))
        const {success, reset} = await ratelimit.login.limit(event.locals.user.id);
        if(!success){
            const timeRemaining = Math.floor((reset - Date.now()) / 1000);
            return message(newInvoiceForm, `Please wait ${timeRemaining}s before trying again.`)
        }
        // await prisma.invoice.create({
        //     data: {
        //         invoiceAmount: newInvoiceForm.data.invoiceAmount,
        //         customerId: newInvoiceForm.data.customerId,
                
        //     }
        // })
    }
};