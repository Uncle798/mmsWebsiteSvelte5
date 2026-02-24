import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { invoiceChangeFormSchema } from '$lib/formSchemas/invoiceChangeFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const invoiceChangeForm = await superValidate(formData, valibot(invoiceChangeFormSchema));
      if(!invoiceChangeForm.valid){
         console.log(invoiceChangeForm);
         return message(invoiceChangeForm, 'Form invalid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(invoiceChangeForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const { data } = invoiceChangeForm;
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: data.invoiceNum
         }
      });
      if(!invoice){
         return message(invoiceChangeForm, 'Invoice not found');
      }
      if(invoice.amountPaid > 0 ){
         return message(invoiceChangeForm, 'Invoice has already been paid can not edit it');
      }
      await prisma.invoice.update({
         where: {
            invoiceNum: invoice.invoiceNum
         },
         data,
      });
      return message(invoiceChangeForm, 'Invoice updated');
   }
};