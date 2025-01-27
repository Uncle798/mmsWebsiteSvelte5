import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const leases = prisma.lease.findMany({
      orderBy: {
         unitNum: 'asc'
      }
   });
   const searchForm = await superValidate(zod(searchFormSchema));
   const leaseCount = await prisma.lease.count();
   const customers = prisma.user.findMany();
   return { leases, searchForm, leaseCount, customers, };
}) satisfies PageServerLoad;