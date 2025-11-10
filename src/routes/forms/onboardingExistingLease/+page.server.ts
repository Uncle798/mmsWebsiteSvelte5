import { message, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingExistingLeaseSchema } from '$lib/formSchemas/schemas';
import { ratelimit } from '$lib/server/rateLimit';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const onboardingExistingLeaseForm = await superValidate(formData, valibot(onboardingExistingLeaseSchema));
      console.log(onboardingExistingLeaseForm);
      if(!onboardingExistingLeaseForm.valid){
         return message(onboardingExistingLeaseForm, 'Form not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(onboardingExistingLeaseForm, `Please wait ${timeRemaining} seconds before trying again`)
      }
      const { data } = onboardingExistingLeaseForm
      const lease = await prisma.lease.create({
         data: {
            customerId: data.customerId,
            addressId: data.addressId,
            leaseCreatedAt: data.createdDate,
            leaseEffectiveDate: data.leaseEffectiveDate,
            price: data.price,
            unitNum: data.unitNum,
            employeeId: event.locals.user.id,
            keysProvided: data.numKeys ? data.numKeys : undefined,
         }
      })
      redirect(303, `/onboarding?leaseId=${lease.leaseId}&userId=${data.customerId}&addressId=${data.addressId}`);
   }
};