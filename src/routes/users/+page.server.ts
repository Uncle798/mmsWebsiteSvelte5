import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { employmentFormSchema } from '$lib/formSchemas/schemas';
import { z } from 'zod';

let page:number=0;
let take:number=25;
let search:string | null = null;
const userSearchFormSchema = z.object({
   search: z.string().min(1).max(255),
})

export const load = (async () => {
   const employmentChangeForm = await superValidate(zod(employmentFormSchema));
   const userSearchForm = await superValidate(zod(userSearchFormSchema));
   const userCount = await prisma.user.count();
   console.log(search);
   if(search){
      const users = await prisma.user.findMany({
         orderBy: [
            {familyName: 'asc'},
            {givenName: 'asc'}
         ],
         take: take,
         skip: page,
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
      console.log(users)
      return { users, userCount,employmentChangeForm, page, take, search, userSearchForm };
   }
   const users = await prisma.user.findMany({
      orderBy: [
         {familyName: 'asc'},
         {givenName: 'asc'}
      ],
      take: take,
      skip: page,
   });
   return { users, userCount, employmentChangeForm, page, take, search, userSearchForm };
}) satisfies PageServerLoad;



export const actions: Actions = {
   changePage: async (event) => {
      const formData = await event.request.formData();
   },
   searchUsers: async (event) => {
      const formData = await event.request.formData();
      const searchForm = await superValidate(formData, zod(userSearchFormSchema));
      search =  searchForm.data.search;
      return {searchForm}
   }
};