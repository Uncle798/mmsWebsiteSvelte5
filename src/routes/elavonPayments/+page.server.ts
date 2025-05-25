import { prisma } from '$lib/server/prisma';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot, zod } from 'sveltekit-superforms/adapters';
import { addressFormSchema, creditCardFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   const newLease = event.url.searchParams.get('newLease');
   const subscription = event.url.searchParams.get('subscription');
   const leaseId = event.url.searchParams.get('leaseId')
   if(!invoiceNum){
      throw error(400, 'No invoice number provided')
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum:parseInt(invoiceNum!, 10),
      }
   })
   if(!invoice){
      throw error(400, 'No invoice found')
   }
   const customer = await prisma.user.findFirst({
      where: {
         id: invoice.customerId!, 
      }
   })
   const ccForm = await superValidate(valibot(creditCardFormSchema));
   const addressForm = await superValidate(zod(addressFormSchema));
   return {invoice, newLease, subscription, leaseId, customer, ccForm, addressForm};
}) satisfies PageServerLoad;