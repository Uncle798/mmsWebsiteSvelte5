import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
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
      const diff = dayjs().diff(lease.leaseEffectiveDate, 'months')
      const dueDate = dayjs(lease.leaseEffectiveDate).add(diff + 1, 'months').toDate()
      const newInvoice = await prisma.invoice.create({
         data: {
            invoiceAmount: lease.price,
            leaseId: lease.leaseId,
            invoiceNotes: `Auto-payment for unit ${lease.unitNum} for ${dayjs(dueDate).format('MMMM YYYY')}`,
            invoiceDue: dueDate,
            customerId: lease.customerId,
         }
      })
      return new Response(JSON.stringify(newInvoice.invoiceNum), {status:200});
   }
};