import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
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
   const invoiceNum = await event.fetch('/api/newAutoPay', {
      method: 'POST',
      body: JSON.stringify({
         leaseId: lease?.leaseId
      })
   }).then(async (response) =>{
      return await response.json()
   })
   console.log(typeof invoiceNum)
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum
      }
   })
   if(!invoice){
      fail(404)
   }
   const creditCardForm = await superValidate(valibot(creditCardFormSchema))
   return { customer, lease, redirectTo, invoice, creditCardForm };
}) satisfies PageServerLoad;