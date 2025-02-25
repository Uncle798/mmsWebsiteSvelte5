import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const redirectTo = event.url.searchParams.get('redirectTo');
   const leaseId = event.url.searchParams.get('leaseId');
   if(!leaseId){
      fail(404)
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId:leaseId!
      }
   })
   const customer = await prisma.user.findUnique({
      where: {
         id: lease?.customerId
      }
   })
   const invoices = await prisma.invoice.findMany({
      where: {
         AND: [
            { customerId: customer?.id },
            { deposit: false }
         ]
      }
   })
   console.log('unsorted: ', invoices)
   if(invoices){
      const sortedInvoices = invoices.sort((a, b) => {
         if(a.invoiceCreated < b.invoiceCreated){
            return 1;
         }
         if(a.invoiceCreated > b.invoiceCreated){
            return -1;
         }
         return 0;
      })
      console.log("sorted: ", sortedInvoices)
   }
   return { customer, lease, redirectTo };
}) satisfies PageServerLoad;