import { redirect } from '@sveltejs/kit';
import type { Actions } from'./$types' 
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { leaseChangeFormSchema } from '$lib/formSchemas/leaseChangeFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const leaseChangeForm = await superValidate(formData, valibot(leaseChangeFormSchema));
      if(!leaseChangeForm.valid){
         console.log(leaseChangeForm);
         return message(leaseChangeForm, 'Form invalid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(leaseChangeForm, `Please wait ${timeRemaining} seconds before trying again.`);
      }
      const { data } = leaseChangeForm;
      console.log(data)
      let lease = await prisma.lease.findUnique({
         where: {
            leaseId: data.leaseId
         }
      });
      if(!lease){
         return message(leaseChangeForm, 'Lease not found');
      }
      lease = await prisma.lease.update({
         where: {
            leaseId: lease.leaseId
         },
         data,
      });
      console.log(lease)
      return message(leaseChangeForm, 'Updated lease');
   }
};