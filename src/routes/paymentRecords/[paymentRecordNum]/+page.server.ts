import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { RefundRecord } from '@prisma/client';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const paymentRecordNum = event.params.paymentRecordNum;
   const paymentRecord = await prisma.paymentRecord.findUnique({
      where: {
         paymentNumber:parseInt(paymentRecordNum, 10)
      },
   })
   const customer = await prisma.user.findUnique({
      where: {
         id: paymentRecord?.customerId
      }
   });
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum: paymentRecord?.invoiceNum ? paymentRecord.invoiceNum : undefined
      }
   });
   let refundRecord:RefundRecord | null = null;
   if(paymentRecord?.refundNumber){
      refundRecord = await prisma.refundRecord.findUnique({
         where: {
            refundNumber: paymentRecord.refundNumber
         }
      })
   }
   return { paymentRecord, customer, invoice, refundRecord };
}) satisfies PageServerLoad;