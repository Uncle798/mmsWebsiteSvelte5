import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitPricingFormSchema } from '$lib/formSchemas/schemas';
import { fail, redirect } from '@sveltejs/kit';
import pricingData from '$lib/server/pricingData';
import type { Lease, Invoice, User } from '@prisma/client';
export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const unitPricingForm = await superValidate(zod(unitPricingFormSchema));
   const size = event.params.size
   
   const units = await prisma.unit.findMany({
      where: {
         size
      },
      orderBy: {
         num: 'asc'
      },
   });
   if(!units){
      fail(404)
   }
   const leases:Lease[] =[];
   const invoices:Invoice[]=[];
   const customers:User[] = [];
   for await (const unit of units) {
      const unitLeases = await prisma.lease.findMany({
         where: {
            unitNum: unit.num
         }
      })
      unitLeases.forEach(async (lease) =>{
         leases.push(lease);
         const unitInvoices = await prisma.invoice.findMany({
            where: {
               leaseId: lease.leaseId
            }
         })
         unitInvoices.forEach((invoice) =>{
            if(!invoice.deposit){
               invoices.push(invoice)
            }
         })
         const customer = await prisma.user.findUnique({
            where: {
               id: lease.customerId,
            }
         })
         if(customer){
            customers.push(customer)
         }
      })
   }
   console.log('invoices ', invoices)
   let totalInvoiced = 0;
   invoices.forEach((invoice) =>{
      totalInvoiced += invoice.invoiceAmount
   })
   const sizes:string[] = [];
   pricingData.forEach((datum) =>{
      sizes.push(datum.size)
   })

   return { units, sizes, unitPricingForm, size, leases, totalInvoiced, customers };
}) satisfies PageServerLoad;