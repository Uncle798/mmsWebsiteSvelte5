import { sendPaymentReceipt } from '$lib/server/mailtrap';
import { prisma } from '$lib/server/prisma';
import { ratelimit } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   if(!event.locals.user){
      return new Response(JSON.stringify('Must be logged in to send email'), {status:401})
   }
   const body = await event.request.json();
   const { recordNum } = body;
   const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id)
   if(!success){
      const timeRemaining = Math.floor((reset - Date.now())/1000);
      return new Response(JSON.stringify(`Please wait ${timeRemaining} seconds before trying again`), {status: 429})
   }
   if(!recordNum){
      return new Response(JSON.stringify('Payment number not provided'), { status:400 })
   }
   const paymentRecord = await prisma.paymentRecord.findUnique({
      where: {
         paymentNumber: recordNum
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
   const address = await prisma.address.findFirst({
      where: {
         AND: [
            {softDelete: false},
            {userId: customer.id}
         ]
      }
   })
   if(!address){
      return new Response(JSON.stringify('Address not found'), {status: 404})
   }
   const res = await sendPaymentReceipt(customer, paymentRecord, address);
   return new Response(JSON.stringify(res), {status:200});
};