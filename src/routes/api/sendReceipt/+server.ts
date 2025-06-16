import { sendPaymentReceipt } from '$lib/server/mailtrap';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   const body = await event.request.json();
   const { paymentRecordNum } = body;
   if(!paymentRecordNum){
      return new Response(JSON.stringify('Payment number not provided'), { status:400 })
   }
   const paymentRecord = await prisma.paymentRecord.findUnique({
      where: {
         paymentNumber: paymentRecordNum
      }
   })
   if(!paymentRecord){
      return new Response(JSON.stringify('Payment record not found'), { status:404 })
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: paymentRecord.customerId
      }
   })
   if(!customer){
      return new Response(JSON.stringify('Customer not found'), { status:500 })
   }
   const res = await sendPaymentReceipt(customer, paymentRecord);
   return new Response(JSON.stringify(res), {status:200});
};