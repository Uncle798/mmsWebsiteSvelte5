import { redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';
import { endLeaseSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.id){
         redirect(302, '/login?toast=unauthorized');
      }
      const formData = await event.request.formData();
      const leaseEndForm = await superValidate(formData, zod(endLeaseSchema));
      const { success, reset } = await ratelimit.register.limit(event.locals.user.id)
      if(!success) {
          const timeRemaining = Math.floor((reset - Date.now()) /1000);
          return message(leaseEndForm, `Please wait ${timeRemaining} seconds before trying again.`)
      }
      if(!leaseEndForm.valid){
         return message(leaseEndForm, 'not valid');
      }
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: leaseEndForm.data.leaseId
         }
      })
      if(lease?.customerId !== event.locals.user.id){
         return message(leaseEndForm, 'Not your lease')
      }
      await prisma.lease.update({
         where: {
            leaseId:leaseEndForm.data.leaseId
         },
         data:{
            leaseEnded: new Date,
         }
      });
      await prisma.unit.update({
         where: {
            num: lease.unitNum,
         },
         data: {
            unavailable: true,
            notes: 'Customer has ended lease. Need to check if it\'s clear and clean',
            leasedPrice: null
         }
      })
      return { leaseEndForm }
   }
};