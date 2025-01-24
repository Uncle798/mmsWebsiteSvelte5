import { prisma } from '$lib/server/prisma';
import {  message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { cuidIdFormSchema, employmentFormSchema } from '$lib/formSchemas/schemas';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { ratelimit } from '$lib/server/rateLimit';



export const load = (async (event) => {
   if(!event.locals.user?.admin){
      redirect(302, '/login?toast=admin')
   }
   const employmentChangeForm = await superValidate(zod(employmentFormSchema));
   const searchForm = await superValidate(zod(searchFormSchema));
   const userCount = await prisma.user.count();
   const users = prisma.user.findMany({
      orderBy: [
         {familyName: 'asc'},
         {givenName: 'asc'}
      ],
   });
   return { users, userCount, employmentChangeForm, searchForm };
}) satisfies PageServerLoad;



export const actions: Actions = {
   search: async (event) => {
      const formData = await event.request.formData();
      const searchForm = await superValidate(formData, zod(searchFormSchema));
      return {searchForm}
   },
   archive: async (event) => {
      if(!event.locals.user?.admin){
         redirect(302, '/login?toast=admin')
      }
      const userDeleteForm = await superValidate(event.request, zod(cuidIdFormSchema));
      if(!userDeleteForm.valid){
         message(userDeleteForm, 'userDeleteForm not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user!.id)
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(userDeleteForm, `Please wait ${timeRemaining} seconds before trying again.`)
      }
      await prisma.user.update({
         where:{
            id: userDeleteForm.data.discountId,
         },
         data:{
            archive: true,
         }
      })
   }
};