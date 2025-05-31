import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Address } from '@prisma/client';

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
   const address = await prisma.address.findUnique({
      where: {
         addressId: lease?.addressId
      }
   })
   let currentAddress:Address | null = null;
   if(address?.softDelete){
      currentAddress = await prisma.address.findFirst({
         where: {
            userId: customer?.id
         }
      })
   }
   return { lease, customer, address, currentAddress };
}) satisfies PageServerLoad;