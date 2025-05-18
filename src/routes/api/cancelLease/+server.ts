import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   const body = await event.request.json();
   const { leaseId } = body;
   console.log(body)
   if(!leaseId){
      return new Response(JSON.stringify('LeaseId not provided'), {status: 400})
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId, 
      }
   })
   if(lease){
      const leaseInvoices = await prisma.invoice.findMany({
         where: {
            leaseId: lease.leaseId
         }
      })
      if(leaseInvoices){
         leaseInvoices.forEach(async (invoice)=> {
            await prisma.invoice.delete({
               where: {
                  invoiceNum: invoice.invoiceNum
               }
            })
         })
      }
      await prisma.lease.delete({
         where: {
            leaseId: lease.leaseId
         }
      })
   }
   return new Response(JSON.stringify('ok'), {status: 200});
};