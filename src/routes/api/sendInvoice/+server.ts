import { sendInvoice } from '$lib/server/mailtrap';
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
      return new Response(JSON.stringify('Invoice number not provided'), { status:400 })
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum: recordNum
      }
   })
   if(!invoice){
      return new Response(JSON.stringify('Invoice not found'), {status:404});
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: invoice.customerId
      }
   })
   if(!customer){
      return new Response(JSON.stringify('Customer not found'), {status:500})
   }
   const res = await sendInvoice(invoice, customer);
   return new Response(JSON.stringify(res), {status:200});
};