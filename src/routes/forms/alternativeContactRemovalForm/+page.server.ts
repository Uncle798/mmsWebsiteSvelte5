import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { alternativeContactRemovalFormSchema } from '$lib/formSchemas/alternativeContactRemovalFormSchema';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=unauthorized');
      }
      const formData = await event.request.formData();
      const alternativeContactRemovalForm = await superValidate(formData, valibot(alternativeContactRemovalFormSchema));
      if(!alternativeContactRemovalForm.valid){
         console.log(alternativeContactRemovalForm);
         return message(alternativeContactRemovalForm, 'Form not valid')
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(alternativeContactRemovalForm, `Please wait ${timeRemaining} seconds before trying again.`)
      }
      await prisma.address.deleteMany({
         where: {
            userId: alternativeContactRemovalForm.data.alternativeContactId
         }
      });
      await prisma.lease.update({
         where: {
            leaseId: alternativeContactRemovalForm.data.leaseId
         },
         data: {
            alternativeContactId: undefined
         }
      })
      await prisma.user.delete({
         where: {
            id: alternativeContactRemovalForm.data.alternativeContactId
         }
      });
      return { alternativeContactRemovalForm }
   }
};