
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { leaseEndFormSchema, unitNotesFormSchema, unitPricingFormSchema } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';


export const load = (async (event) => {
   const unitNum = event.params.unitNum;
   if(!event.locals.user?.employee){
      redirect(302, `/login?toast=employee&redirect=units&unitNum=${unitNum}`)
   }
   if(!unitNum){
      fail(400)
   }
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum
      }, 
   });
   const leases = await prisma.lease.findMany({
      where: {
         unitNum: unit?.num
      },
      orderBy: {
         leaseEnded: {
            sort: 'asc',
            nulls: 'first'
         }
      },
      include: {
         customer: true
      }
   })
   let totalRevenue: number = 0;
   leases.forEach((lease) => {
      let lengthOfLease:number = 0;
      if(!lease.leaseEnded){
         lengthOfLease = dayjs().diff(lease.leaseEffectiveDate, 'months')
      } else {
         lengthOfLease = dayjs(lease.leaseEnded).diff(lease.leaseEffectiveDate, 'months');
      }
      for(let i=0; i<lengthOfLease; i++){
         totalRevenue += lease.price
      }
   })
   const unitNotesForm = await superValidate(zod(unitNotesFormSchema));
   const unitPricingForm = await superValidate(zod(unitPricingFormSchema));
   const leaseEndForm = await superValidate(zod(leaseEndFormSchema));
   return { unit, leases, unitNotesForm, unitPricingForm, leaseEndForm, totalRevenue };
}) satisfies PageServerLoad;