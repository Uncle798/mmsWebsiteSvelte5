import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { superValidate, message,} from 'sveltekit-superforms';
import { prisma } from '$lib/server/prisma';
import { ratelimit } from '$lib/server/rateLimit';
import { valibot } from 'sveltekit-superforms/adapters';
import { newInvoiceFormSchema } from '$lib/formSchemas/newInvoiceFormSchema';


export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const newInvoiceForm = await superValidate(formData, valibot(newInvoiceFormSchema))
      const {success, reset} = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(newInvoiceForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      if(!newInvoiceForm.valid){
        return message(newInvoiceForm, 'Unable to process')
      }
      const invoice = await prisma.invoice.create({
         data: {
            invoiceAmount: newInvoiceForm.data.invoiceAmount,
            customerId: newInvoiceForm.data.customerId,
            invoiceNotes: newInvoiceForm.data.invoiceNotes,
            leaseId: newInvoiceForm.data.leaseId,
            deposit: newInvoiceForm.data.deposit,
            invoiceDue: newInvoiceForm.data.invoiceDue
         }
      })
      redirect(302, `/invoices/${invoice.invoiceNum}`);
   }
};