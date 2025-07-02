import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { creditCardFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   const redirectTo = event.url.searchParams.get('redirectTo');
   const leaseId = event.url.searchParams.get('leaseId');
   if(!event.locals.user){
      redirect(302, `/login?toast=unauthorized&redirectTo=${redirectTo}&leaseId=${leaseId}`)
   }
   if(!leaseId){
      error(400)
   }
   const lease = await prisma.lease.findUnique({
      where: {
         leaseId:leaseId!
      }
   })
   if(!lease){
      error(404)
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: lease!.customerId
      }
   })
   if(!customer){
      error(404)
   }
   const invoiceNum = await event.fetch('/api/newAutoPay', {
      method: 'POST',
      body: JSON.stringify({
         leaseId: lease?.leaseId
      })
   }).then(async (response) =>{
      return await response.json()
   })
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum
      }
   })
   if(!invoice){
      error(404)
   }
   const creditCardForm = await superValidate(valibot(creditCardFormSchema))
   return { customer, lease, redirectTo, invoice, creditCardForm };
}) satisfies PageServerLoad;