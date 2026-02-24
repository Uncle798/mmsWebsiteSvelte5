import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async (event) => {
   if(!event.locals.user?.employee){
      return new Response(JSON.stringify('Must be an employee'), {status: 401});
   }
   const body = await event.request.json();
   const {invoiceNum} = body;
   if(!invoiceNum){
      return new Response(JSON.stringify('invoiceNum not provided'), {status: 400});
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum
      }
   });
   if(!invoice){
      return new Response(JSON.stringify('Invoice not found'), { status: 404});
   }
   await prisma.invoice.delete({
      where: {
         invoiceNum: invoice.invoiceNum
      }
   })
   return new Response(JSON.stringify(`Invoice ${invoice.invoiceNum} deleted`), {status: 200});
};