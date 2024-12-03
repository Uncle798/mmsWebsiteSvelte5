import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const userSearchForm = await superValidate(zod(searchFormSchema))
   const customers = await prisma.user.findMany({
      where: {
         customerLeases: {
            some: {
               leaseEnded: null
            }
         }
      },
      include: {
         customerLeases: {
            orderBy: {
               unitNum: 'asc'
            }
         },  
      },
      orderBy: {
         familyName: 'asc'
      }
   });
   const leases = await prisma.lease.findMany({
      where: {
         leaseEnded: null,
      },
      orderBy: {
         unitNum: 'asc'
      }
   })
   return { customers, leases, userSearchForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      const formData = await event.request.formData();
      const searchForm = await superValidate(formData, zod(searchFormSchema));
      return {searchForm}
   }
};