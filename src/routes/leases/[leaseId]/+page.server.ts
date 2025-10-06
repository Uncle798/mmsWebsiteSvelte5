import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Address } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { leaseEndFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const leaseId = event.params.leaseId;
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId,
      }
   })
   if(!event.locals.user.employee && lease?.customerId !== event.locals.user.id){
      redirect(302, '/login?toast=employee')
   }
   const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
   const customer = await prisma.user.findUnique({
      where: {
         id: lease?.customerId
      }
   })
   const address = await prisma.address.findUnique({
      where: {
         addressId: lease?.addressId
      }
   })
   let currentAddress:Address | null = null;
   if(address?.softDelete){
      currentAddress = await prisma.address.findFirst({
         where: {
            userId: customer?.id
         }
      })
   }
   const invoices = await prisma.invoice.findMany({
      where: {
         leaseId: lease?.leaseId
      },
      orderBy: {
         invoiceCreated: 'asc'
      }
   })
   return { lease, customer, address, currentAddress, leaseEndForm, invoices };
}) satisfies PageServerLoad;