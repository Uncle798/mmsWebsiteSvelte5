import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingCreateManyInvoicesFormSchema } from '$lib/formSchemas/onboardingCreateManyInvoicesFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import type { Invoice } from '../../../generated/prisma/client';
import { arrayOfMonths } from '$lib/server/utils';
import dayjs from 'dayjs';
import { invoiceRentNote } from '$lib/utils/invoiceNoteRent';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const onboardingCreateManyInvoicesForm = await superValidate(formData, valibot(onboardingCreateManyInvoicesFormSchema));
      if(!onboardingCreateManyInvoicesForm.valid){
         return message(onboardingCreateManyInvoicesForm, 'Form invalid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(onboardingCreateManyInvoicesForm, `Please wait ${timeRemaining}s before trying again.`);
		}
      const { data } = onboardingCreateManyInvoicesForm;
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: data.leaseId
         }
      });
      if(!lease){
         return message(onboardingCreateManyInvoicesForm, 'Lease not found');
      }
      let endingDate = dayjs().add(1,'month').toDate()
      if(data.endingDate){
         endingDate = data.endingDate
      }
      const months = arrayOfMonths(data.startingDate, endingDate);
      type PartialInvoice = Omit<Invoice, 'invoiceNum' | 'invoiceCreated' >
      const invoices:PartialInvoice[] = [];
      for(const month of months){
         const invoice:PartialInvoice = {
            customerId: lease.customerId,
            leaseId: lease.leaseId,
            invoiceDue: month,
            invoiceAmount: lease.price,
            employeeId: event.locals.user.id,
            deposit: false,
            amountPaid: 0,
            invoiceNotes: invoiceRentNote(lease.unitNum, lease.leaseEffectiveDate)
         }
         invoices.push(invoice);
      }
      await prisma.invoice.createMany({
         data: invoices
      })
      return { onboardingCreateManyInvoicesForm }
   }
};