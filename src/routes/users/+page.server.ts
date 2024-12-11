import { prisma } from '$lib/server/prisma';
import {  superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { employmentFormSchema } from '$lib/formSchemas/schemas';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';



export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const employmentChangeForm = await superValidate(zod(employmentFormSchema));
   const searchForm = await superValidate(zod(searchFormSchema));
   const userCount = await prisma.user.count();
   const search = event.url.searchParams.get('search');
   if(search){
      const users = await prisma.user.findMany({
         orderBy: [
            {familyName: 'asc'},
            {givenName: 'asc'}
         ],
         where: {
            OR:[
               {givenName: {
                  contains: search,
                  mode: 'insensitive'
               }},
               {familyName: {
                  contains: search,
                  mode: 'insensitive'
               }}
            ]
         }
         
      });
      return { users, userCount,employmentChangeForm, search, searchForm };
   }
   const users = await prisma.user.findMany({
      orderBy: [
         {familyName: 'asc'},
         {givenName: 'asc'}
      ],
   });
   return { users, userCount, employmentChangeForm, search, searchForm };
}) satisfies PageServerLoad;



export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const searchForm = await superValidate(formData, zod(searchFormSchema));
      return {searchForm}
   }
};