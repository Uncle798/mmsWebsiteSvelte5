import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from '$lib/valibot';
import { leaseDeleteFormSchema } from '$lib/formSchemas/leaseDeleteFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const leaseDeleteForm = await superValidate(formData, valibot(leaseDeleteFormSchema));
      if(!leaseDeleteForm.valid){
         console.error(leaseDeleteForm);
         return message(leaseDeleteForm, 'Form not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
			return message(leaseDeleteForm, `Please wait ${timeRemaining}s before trying again.`);
      }
      const { data } = leaseDeleteForm;
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: data.leaseId
         }
      });
      if(!lease){
         return message(leaseDeleteForm, 'Lease not found');
      }
      const invoices = await prisma.invoice.findMany({
         where: {
            leaseId: lease.leaseId
         }
      });
      if(invoices){
         return message(leaseDeleteForm, 'Invoices must be deleted first');
      }
      await prisma.lease.delete({
         where: {
            leaseId: lease.leaseId
         }
      })
      return redirect(302, '/leases');
   }
};