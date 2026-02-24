import type { RequestHandler } from './$types';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async (event) => {
   if(!event.locals.user?.employee){
      return new Response(JSON.stringify('Must be an employee'), {status: 401});
   }
   const { userId, leaseId } = await event.request.json();
   if(!userId){
      return new Response(JSON.stringify('userId not provided'), {status: 400});
   }
   if(!leaseId){
      return new Response(JSON.stringify('leaseId not provided'), {status: 400});
   }
   const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
   if(!success){
      const timeRemaining = Math.floor((reset - Date.now())/1000);
      return new Response(JSON.stringify(`Please wait ${timeRemaining} seconds before trying again`), {status: 429})
   }
   const altContact = await prisma.user.findUnique({
      where: {
         id:userId
      }
   })
   if(!altContact){
      return new Response(JSON.stringify('user not found'), {status: 404});
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId
      }
   });
   if(!lease){
      return new Response(JSON.stringify('lease not found'), {status: 400});
   }
   const leaseAlternativeContact = await prisma.leaseAlternativeContacts.create({
      data: {
         leaseId: lease.leaseId,
         userId: altContact.id
      },
   })
   return new Response(JSON.stringify(leaseAlternativeContact), {status: 200});
};