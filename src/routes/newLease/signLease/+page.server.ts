import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { createLease } from '$lib/server/anvil';
import type { ResponseError, NodeError, } from '@anvilco/anvil';

export const load = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized');
   }
   const leaseId = event.url.searchParams.get('leaseId');
   if(!leaseId){
      return {};
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId,
      }
   })
   if(!lease){
      return {};
   }
   const unit = await prisma.unit.findUnique({
      where: {
         num: lease.unitNum
      }
   });
   const address = await prisma.address.findUnique({
      where: {
         addressId: lease.addressId
      }
   });
   const alternateContactLease = await prisma.leaseAlternativeContacts.findFirst({
      where: {
         leaseId: lease.leaseId
      }
   });
   const altContact = await prisma.user.findUnique({
      where: {
         id: alternateContactLease?.userId
      }
   });
   const altAddress = await prisma.address.findFirst({
      where: {
         userId: altContact?.id
      }
   });
   const employee = await prisma.user.findUnique({
      where: {
         email: 'info@moscowministorage.com'
      }
   })
   if(lease && unit && address && employee){
      const contract = await createLease(event.locals.user, lease, unit, employee, address, altContact, altAddress, true) as  { url:string, errors: (ResponseError | NodeError)[] | undefined, filename:string }
      if (contract.errors) {
         // Note: because of the nature of GraphQL, statusCode may be a 200 even when
         // there are errors.
         console.error('There were errors!')
         console.error(JSON.stringify(contract.errors, null, 2));
      } 
      return { contract, address, lease, altAddress, altContact};
   } else {
      console.error('something was missing')
   }
   return {};
}) satisfies PageServerLoad;