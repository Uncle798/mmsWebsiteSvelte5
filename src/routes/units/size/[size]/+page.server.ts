import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitPricingFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import type { Invoice, User } from '@prisma/client';

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
   const leases = await prisma.lease.findMany({
      where: {
         unit: {
            size: '04x06'
         }
      }
   })
   const invoices:Invoice[] = [];
   const customers:User[] = [];
   leases.forEach(async (lease) =>{
      const dbInvoices = await prisma.invoice.findMany({
         where:{
            leaseId: lease.leaseId
         }
      });
      dbInvoices.forEach((invoice) =>{
         if(!invoice.deposit){
            invoices.push(invoice)
         }
      })
      const customer = await prisma.user.findUnique({
         where: {
            id: lease.customerId
         }
      })
      if(customer){
         customers.push(customer)
      }
   })
   const allUnits = await prisma.unit.findMany({
      orderBy:{
         size: 'asc'
      },
      where:{
         size: {
            not: 'ours'
         }
      }
   });
   const sizes:string[] = [];
   allUnits.forEach((unit) =>{
      const unitSize = unit.size;
      const sizeSize = sizes.find((size) => size === unitSize);
      if(!sizeSize){
         sizes.push(unitSize);
      }
   })
   return { units, size, unitPricingForm, sizes, leases, invoices, customers };
}) satisfies PageServerLoad;