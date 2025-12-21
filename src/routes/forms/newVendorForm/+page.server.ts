import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { newVendorFormSchema } from '$lib/formSchemas/newVendorFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const newVendorForm = await superValidate(formData, valibot(newVendorFormSchema));
      if(!newVendorForm.valid){
         return message(newVendorForm, 'Form invalid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(newVendorForm, `Please wait ${timeRemaining} seconds before trying again`);
      }
      const vendor = await prisma.user.create({
      const vendor = await prisma.user.create({
         data: {
            organizationName: newVendorForm.data.organizationName,
            vendor: true
         }
      });
      redirect(302, `/expenses/new?vendorId=${vendor.id}`);
   }
};