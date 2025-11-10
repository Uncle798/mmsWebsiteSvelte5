import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';
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
   const addresses = prisma.address.findMany();
   const searchForm = await superValidate(valibot(searchFormSchema));
   const leaseCount = await prisma.lease.count();
   const customers = prisma.user.findMany();
   return { leases, searchForm, leaseCount, customers, addresses };
}) satisfies PageServerLoad;