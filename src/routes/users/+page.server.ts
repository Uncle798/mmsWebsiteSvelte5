import { prisma } from '$lib/server/prisma';
import {  message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { cuidIdFormSchema, employmentFormSchema } from '$lib/formSchemas/schemas';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { ratelimit } from '$lib/server/rateLimit';



export const load = (async (event) => {
   if(!event.locals.user?.admin){
      redirect(302, '/login?toast=admin')
   }
   const employmentChangeForm = await superValidate(valibot(employmentFormSchema));
   const searchForm = await superValidate(valibot(searchFormSchema));
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
      const searchForm = await superValidate(formData, valibot(searchFormSchema));
      return {searchForm}
   },
   archive: async (event) => {
      if(!event.locals.user?.admin){
         redirect(302, '/login?toast=admin')
      }
      const userDeleteForm = await superValidate(event.request, valibot(cuidIdFormSchema));
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
            id: userDeleteForm.data.cuid2Id,
         },
         data:{
            archive: true,
         }
      })
   }
};