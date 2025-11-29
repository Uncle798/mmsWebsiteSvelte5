import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async (event) => {
   if(!event.locals.user?.employee){
      return new Response(JSON.stringify('You must be an employee'), {status: 401});
   }
   const body = await event.request.json();
   if(!body.leaseId){
      return new Response(JSON.stringify('leaseId not provided'), {status: 400});
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId: body.leaseId,
      }
   })
   if(!lease){
      return new Response(JSON.stringify('Lease not found'), {status: 404});
   }
   await prisma.address.deleteMany({
      where: {
         user: {
            leaseAlternativeContacts: {
               some: {
                  leaseId: lease.leaseId
               }
            }
         }
      }
   });
   await prisma.user.deleteMany({
      where: {
         leaseAlternativeContacts: {
            some: {
               leaseId: lease.leaseId
            }
         }
      }
   });
   await prisma.leaseAlternativeContacts.deleteMany({
      where: {
         leaseId: lease.leaseId
      }
   })
   await prisma.lease.delete({
      where: {
         leaseId: lease.leaseId
      }
   })
   return new Response(JSON.stringify('Lease deleted'), {status: 200});
};