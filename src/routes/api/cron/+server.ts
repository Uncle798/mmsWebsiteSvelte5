import { CRON_SECRET } from '$env/static/private';
import { sendStatusEmail } from '$lib/server/mailtrap';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { RequestHandler} from './$types';
import type { Invoice } from '../../../generated/prisma/client';
import { makeTodaysInvoicesReport } from '$lib/server/pdfMake/makeTodaysInvoicesReport';
export const GET:RequestHandler = async (event) => {
   const authHeader = event.request.headers.get('authorization');
   if(authHeader !== `Bearer ${CRON_SECRET}`){
      return new Response(JSON.stringify({success:false}), { status:401 });
   }
   const leases = await prisma.lease.findMany({
      where: {
         leaseEnded: null
      }
   });
   let today = dayjs();
   const todaysLeases = leases.filter((lease) => dayjs(lease.leaseEffectiveDate).date() === today.date());
   const todaysInvoices:Invoice[] = [];
   for(const lease of todaysLeases){
      let invoice = await prisma.invoice.findFirst({
         where: {
            invoiceCreated: {
               gte: new Date(new Date().setHours(0,0,0,0))
            }
         }
      });
      if(!invoice){
         invoice = await prisma.invoice.findFirst({
            where: {
               AND: [
                  {
                     invoiceDue: {
                        gte: today.add(1,'month').set('minutes', 0).set('hours', 0).set('seconds', 0).toDate(),
                     }
                  },
                  {
                     invoiceDue: {
                        lte: today.add(1, 'month').set('hours', 24).set('minutes', 59).set('seconds', 59).set('milliseconds', 1000).toDate(),
                     }
                  }
               ]
            }
         })
      }
      if(!invoice){
         todaysInvoices.push(
            await prisma.invoice.create({
               data: {
                  leaseId: lease.leaseId,
                  invoiceAmount: lease.price,
                  customerId: lease.customerId,
                  invoiceDue: today.add(1, 'month').toDate(),
                  invoiceNotes: `Rent for unit ${lease.unitNum.replace(/^0/gm, '')} for ${today.format('MMMM D YYYY')} - ${today.add(1,'month').format('MMMM D YYYY')}`
               }
            })
         )
      }
   }
   let totalInvoiced = 0;
   for(const invoice of todaysInvoices){
      totalInvoiced += invoice.invoiceAmount;
   }
   const units = await prisma.unit.findMany();
   const leasedCount = await prisma.lease.count({
      where: {
         leaseEnded: null
      }
   });
   const customers = await prisma.user.findMany({
      where: {
         customerLeases: {
            some: {
               leaseEnded: null,
            }
         }
      }
   })
   const admins = await prisma.user.findMany({
      where: {
         admin: true
      }
   });
   for(const admin of admins){
      await sendStatusEmail(admin, todaysInvoices.length, totalInvoiced, units.length - leasedCount, (await makeTodaysInvoicesReport(todaysInvoices, customers, false) as PDFKit.PDFDocument))
   }
   return new Response(JSON.stringify({success:true}), { status: 200 })
}