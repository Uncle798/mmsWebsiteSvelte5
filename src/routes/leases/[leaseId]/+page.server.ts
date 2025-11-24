import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Address } from '../../../generated/prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { leaseEndFormSchema } from '$lib/formSchemas/leaseEndFormSchema';
import { alternativeContactFormSchema } from '$lib/formSchemas/alternativeContactFormSchema';

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
   const alternativeContactForm = await superValidate(valibot(alternativeContactFormSchema));
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
   const alternativeContact = await prisma.user.findFirst({
      where: {
         alternativeContactLeases: {
            some: {
               leaseId,
            }
         }
      }
   });
   const alternativeContactAddress = await prisma.address.findFirst({
      where: {
         userId: alternativeContact?.id
      }
   })
   const invoices = await prisma.invoice.findMany({
      where: {
         leaseId: lease?.leaseId
      },
      orderBy: {
         invoiceCreated: 'asc'
      }
   })
   return { 
      lease, 
      customer, 
      address, 
      currentAddress, 
      leaseEndForm, 
      alternativeContactForm,
      invoices, 
      alternativeContact, 
      alternativeContactAddress 
   };
}) satisfies PageServerLoad;