import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { leaseUploadFormSchema } from '$lib/formSchemas/leaseUploadFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { put } from '@vercel/blob';
import dayjs from 'dayjs';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      return redirect(302, '/login?toast=employee');
   }
   const leaseUploadForm = await superValidate(valibot(leaseUploadFormSchema));
   return { leaseUploadForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         return redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const leaseUploadForm = await superValidate(formData, valibot(leaseUploadFormSchema));
      if(!leaseUploadForm.valid){
         console.error(leaseUploadForm);
         return message(leaseUploadForm, 'Form invalid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(leaseUploadForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const { data } = leaseUploadForm; 
      const blob = await put(`MMS Lease ${dayjs().format('mm-dd-yyyy')}.pdf`, data.lease, { access: 'public'});
      return new Response(JSON.stringify(blob), { status: 200});
   }
};