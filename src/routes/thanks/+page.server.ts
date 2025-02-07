import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   if(invoiceNum){
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: parseInt(invoiceNum, 10),
         }
      })
      const paymentRecord = await prisma.paymentRecord.findFirst({
         where: {
            invoiceNum: invoice?.invoiceNum
         }
      })
      const customer = await prisma.user.findFirst({
         where: {
            id: invoice!.customerId!
         }
      })
      const address = await prisma.address.findFirst({
         where: {
            userId: invoice!.customerId!
         }
      })
      return { paymentRecord, invoice, customer, address }
   }
   return {};
}) satisfies PageServerLoad;