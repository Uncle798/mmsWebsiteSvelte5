import { CRON_SECRET } from '$env/static/private';
import { sendStatusEmail } from '$lib/server/mailtrap';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { RequestHandler} from './$types';
import type { Invoice } from '@prisma/client';
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
      todaysInvoices.push(await prisma.invoice.create({
         data: {
            leaseId: lease.leaseId,
            invoiceAmount: lease.price,
            customerId: lease.customerId,
            invoiceDue: today.add(1, 'month').toDate(),
         }
      }))
   }
   let totalInvoiced = 0;
   for(const invoice of todaysInvoices){
      totalInvoiced += invoice.invoiceAmount
   }
   const emptyUnits = await prisma.unit.count({
      where: {
         lease: {
            some: {
               leaseEnded: {
                  not: null
               }
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
      await sendStatusEmail(admin, todaysInvoices.length, totalInvoiced, emptyUnits)
   }
   return new Response(JSON.stringify({success:true}), { status: 200 })
}