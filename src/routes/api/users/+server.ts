import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async (event) => {
   if(!event.locals.user?.admin){
      return new Response(null, {status: 401});
   }
   const body = await event.request.json();
   const { userId } = body;
   if(!userId){
      return new Response(JSON.stringify('User ID not provided'), { status:400 });
   }
   const user = await prisma.user.findUnique({
      where: {
         id: userId
      }
   })
   if(user){
      await prisma.verification.deleteMany({
         where: {
            userId: user.id
         }
      })
      await prisma.session.deleteMany({
         where: {
            userId: user.id
         }
      });
      await prisma.refundRecord.deleteMany({
         where: {
            customerId: user.id
         }
      })
      await prisma.paymentRecord.deleteMany({
         where: {
            customerId: user.id
         }
      })
      await prisma.invoice.deleteMany({
         where: {
            customerId: user.id
         }
      })
      await prisma.lease.deleteMany({
         where: {
            customerId: user.id
         }
      })
      await prisma.address.deleteMany({
         where: {
            userId: user.id
         }
      })
      await prisma.user.deleteMany({
         where: {
            id: user.id
         }
      })
   }
   return new Response(JSON.stringify('User deleted'), { status:200 });
};