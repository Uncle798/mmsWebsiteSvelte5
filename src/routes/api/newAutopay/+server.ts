import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
   const body = await event.request.json();
   const {leaseId} = body;
   if(!leaseId){
      return new Response(JSON.stringify('leaseId not provided'), {status:400})
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId,
      }
   });
   if(!lease){
      return new Response(JSON.stringify('lease not found'), {status:404})
   }
   const invoice = await prisma.invoice.findFirst({
      where: {
         AND: [
            { leaseId: lease.leaseId },
            { paymentRecordNum: null }
         ]
      }
   })
   if(invoice){
      return new Response(JSON.stringify(invoice.invoiceNum), {status: 200})
   } else {
      const previousInvoice = await prisma.invoice.findFirst({
         orderBy:{
            invoiceDue:'desc'
         },
         where:{
            leaseId: lease.leaseId
         }
      })

   }

   return new Response();
};