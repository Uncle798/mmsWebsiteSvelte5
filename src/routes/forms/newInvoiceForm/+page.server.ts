import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { prisma } from '$lib/server/prisma';
import { ratelimit } from '$lib/server/rateLimit';
import { zod } from 'sveltekit-superforms/adapters';
import { newInvoiceFormSchema } from '$lib/formSchemas/schemas';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
     }
     const formData = await event.request.formData();
     console.log(formData)
     const newInvoiceForm = await superValidate(formData, zod(newInvoiceFormSchema))
     const {success, reset} = await ratelimit.login.limit(event.locals.user.id);
     if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(newInvoiceForm, `Please wait ${timeRemaining}s before trying again.`)
     }
     await prisma.invoice.create({
         data: {
             invoiceAmount: newInvoiceForm.data.invoiceAmount,
             customerId: newInvoiceForm.data.customerId,
             invoiceNotes: newInvoiceForm.data.invoiceNotes,
             leaseId: newInvoiceForm.data.leaseId,
         }
     })
   }
};