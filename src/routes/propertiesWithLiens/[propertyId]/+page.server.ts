import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   const propertyId = event.params.propertyId;
   const property = await prisma.propertyWithLien.findUnique({
      where: {
         id: propertyId
      }
   });
   const contact = await prisma.user.findUnique({
      where: {
         id: property?.userId
      }
   });
   const address = await prisma.address.findUnique({
      where: {
         addressId: property?.addressId
      }
   });
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId: property?.leaseId
      }
   });
   return { property, contact, address, lease, };
}) satisfies PageServerLoad;