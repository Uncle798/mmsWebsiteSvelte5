import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const redirectTo = event.url.searchParams.get('redirectTo');
   const leaseId = event.url.searchParams.get('leaseId');
   if(!leaseId){
      fail(404)
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: event.locals.user.id
      }
   })
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId:leaseId!
      }
   })
   return { customer, lease, redirectTo };
}) satisfies PageServerLoad;