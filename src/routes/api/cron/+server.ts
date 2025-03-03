import { CRON_SECRET, MY_EMAIL } from '$env/static/private';
import { prisma } from '$lib/server/prisma';
import type { Invoice, Lease } from '@prisma/client';
import type { RequestHandler } from './$types';
import { sendInvoice, sendStatusEmail } from '$lib/server/mailtrap';

export const GET: RequestHandler = async ({request}) => {
   const authHeader = request.headers.get('authorization')
   if(authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response(JSON.stringify({success:false}), {status: 401})
   }
   const handleRequest = async (r:Request) => {
      console.log(r)
      const leases = await prisma.lease.findMany({
         where: {
            leaseEnded: null
         }
      });
      const todaysLeases:Lease[] =[];
      leases.forEach((lease) => {
         console.log(lease.leaseEffectiveDate.getDate())
         if(lease.leaseEffectiveDate.getDate() === new Date().getDate()){
            todaysLeases.push(lease)
         }
      })
      // for testing
      const customer = await prisma.user.findUnique({
         where: {
            email: MY_EMAIL
         }
      })
      // const customers = await prisma.user.findMany({
      //    where:{
      //       customerLeases: {
      //          some:{
      //             leaseEnded: null
      //          }
      //       }
      //    }
      // })
      const invoices:Invoice[] = [];
      let totalInvoiced = 0;
      for await(const lease of todaysLeases){
         const invoice = await prisma.invoice.create({
            data: {
               leaseId:lease.leaseId,
               invoiceAmount: lease.price,
               customerId: lease.customerId,
               invoiceNotes: `Monthly rent for unit ${lease.unitNum.replace(/^0+/gm, '')}`
            }
         });
         invoices.push(invoice);
         totalInvoiced += invoice.invoiceAmount
      }
      console.log("number of invoices", invoices.length)
      for await(const invoice of invoices){
         // const customer = customers.find((customer) => customer.id === invoice.customerId)
         await sendInvoice(invoice, customer!)
      }
      const fullUnits = await prisma.unit.count({
         where: {
            lease: {
               some: {
                  leaseEnded: null
               }
            }
         }
      })
      const unitCount = await prisma.unit.count();
      const admins = await prisma.user.findMany({
         where: {
            admin: true
         }
      })
      for await(const admin of admins){
         await sendStatusEmail(admin, invoices.length, totalInvoiced, (unitCount - fullUnits))
      }
   }
   handleRequest(request)
   return new Response(JSON.stringify({success:true}), {status: 200});
};