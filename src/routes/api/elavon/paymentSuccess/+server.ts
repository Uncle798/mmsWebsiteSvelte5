import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   const subscription = event.url.searchParams.get('subscription')
   const body = await event.request.json()
   const { ssl_invoice_number, ssl_txn_id, ssl_amount } = body;
   if(ssl_invoice_number){
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: parseInt(ssl_invoice_number, 10)
         }
      })
      if(!invoice){
         return new Response(JSON.stringify('No invoice found'), {status: 404});
      }
      const paymentRecord = await prisma.paymentRecord.create({
         data: {
            invoiceNum: invoice.invoiceNum,
            paymentAmount: parseInt(ssl_amount, 10),
            paymentType: 'STRIPE',
            customerId: invoice.customerId, 
            paymentNotes: `Payment for invoice number ${invoice.invoiceNum}, ${invoice.invoiceNotes}`,
            transactionId: ssl_txn_id
         }
      })
      await prisma.invoice.update({
         where: {
            invoiceNum: invoice.invoiceNum
         },
         data: {
            paymentRecordNum: paymentRecord.paymentNumber
         }
      })
      if(subscription){
         await prisma.lease.update({
            where: {
               leaseId: invoice.leaseId!,
            },
            data: {
               subscriptionId: ssl_txn_id
            }
         })
      }
      return new Response(JSON.stringify(invoice.invoiceNum), {status: 200})
   }
   return new Response(null);
};