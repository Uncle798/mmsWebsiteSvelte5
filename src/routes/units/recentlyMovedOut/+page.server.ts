import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types';
import type { Invoice, PaymentRecord } from '@prisma/client';

export const load = (async () => {
   const leases = await prisma.lease.findMany({
      where: {
         leaseEnded:{
            gt: dayjs(new Date()).subtract(1, 'year').toDate()
         }
      },
      orderBy: {
         leaseEnded: 'desc'
      }
   })
   const invoices:Invoice[] =[];
   leases.forEach(async (lease)=> {
      const invoice = await prisma.invoice.findFirst({
         where: {
            AND:[
               { leaseId: lease.leaseId },
               { invoiceNotes: {
                  contains: 'deposit'
               }}
            ]
         }
      })
      if(invoice){
         invoices.push(invoice);
      }
   })
   const paymentRecords:PaymentRecord[] =[]
   invoices.forEach(async (invoice) =>{
      const paymentRecord = await prisma.paymentRecord.findUnique({
         where: {
            paymentNumber: invoice.paymentRecordNum!
         }
      })
      if(paymentRecord){
         paymentRecords.push(paymentRecord);
      }
   })
   return { leases, invoices, paymentRecords};
}) satisfies PageServerLoad;