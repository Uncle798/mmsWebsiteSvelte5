import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';

export const load = (async (event) => {
   const redirectTo = event.url.searchParams.get('redirectTo');
   const leaseId = event.url.searchParams.get('leaseId');
   if(!event.locals.user){
      redirect(302, `/login?toast=unauthorized&redirectTo=${redirectTo}&leaseId=${leaseId}`)
   }
   if(!leaseId){
      fail(400)
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId:leaseId!
      }
   })
   if(!lease){
      fail(404)
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: lease!.customerId
      }
   })
   if(!customer){
      fail(404)
   }
   let invoice = await prisma.invoice.findFirst({
      where: {
         AND:[
            {leaseId: lease!.leaseId},
            {paymentRecordNum: null}
         ]
      }
   })
   if(invoice){
      return { customer, lease, redirectTo, invoice}
   } else {
      const previousInvoice = await prisma.invoice.findFirst({
         where: {
            leaseId
         },
         orderBy: {
            invoiceDue: 'desc'
         }
      })
      invoice = await prisma.invoice.create({
         data: {
            leaseId: lease!.leaseId,
            invoiceAmount: lease!.price,
            invoiceDue: dayjs(previousInvoice?.invoiceDue).add(1, "month").toDate(),
            customerId: customer!.id

         }
      })
   }
   return { customer, lease, redirectTo, invoice };
}) satisfies PageServerLoad;