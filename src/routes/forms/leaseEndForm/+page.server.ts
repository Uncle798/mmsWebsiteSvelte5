import { error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import { valibot } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';
import { leaseEndFormSchema } from '$lib/formSchemas/schemas';
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
      const leaseEndForm = await superValidate(formData, valibot(leaseEndFormSchema));
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id)
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
      if(!lease){
         error(404)
      }
      if(lease.customerId !== event.locals.user.id && !event.locals.user.employee){
         return message(leaseEndForm, 'Not your lease')
      }
      if(lease.subscriptionId){
         const response = await event.fetch('/api/elavon/cancelRecurring', {
            method: "POST",
            body: JSON.stringify({leaseId: lease.leaseId})
         })
         if(response){
            await prisma.lease.update({
               where: {
                  leaseId: lease.leaseId
               },
               data: {
                  subscriptionId: null
               }
            })
         }
      }
      await prisma.lease.update({
         where: {
            leaseId:leaseEndForm.data.leaseId
         },
         data:{
            leaseEnded: new Date(),
         }
      });
      let notes = ''
      if(leaseEndForm.data.customer){
         notes='Customer has ended lease. Need to check if it\'s clear and clean'
      }
      await prisma.unit.update({
         where: {
            num: lease?.unitNum,
         },
         data: {
            unavailable: leaseEndForm.data.customer ? true : false,
            notes,
            leasedPrice: null
         }
      })
      return { leaseEndForm }
   }
};