import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const leaseId = event.params.leaseId
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId,
      }
   })
   if(!event.locals.user.employee && lease?.customerId !== event.locals.user.id){
      redirect(302, '/login?toast=employee')
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: lease?.customerId
      }
   })
   return { lease, customer, };
}) satisfies PageServerLoad;