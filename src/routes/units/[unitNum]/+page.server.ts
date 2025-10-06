
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Address, User } from '@prisma/client';
import { leaseEndFormSchema, unitNotesFormSchema, unitPricingFormSchema } from '$lib/formSchemas/schemas';
import dayjs from 'dayjs';


export const load = (async (event) => {
   const unitNum = event.params.unitNum;
   if(!event.locals.user?.employee){
      redirect(302, `/login?toast=employee&redirect=units&unitNum=${unitNum}`)
   }
   if(!unitNum){
      error(400)
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
   })
   const customers:User[] = []
   let totalRevenue: number = 0;
   for await (const lease of leases) {
      let lengthOfLease:number = 0;
      if(!lease.leaseEnded){
         lengthOfLease = dayjs().diff(lease.leaseEffectiveDate, 'months')
      } else {
         lengthOfLease = dayjs(lease.leaseEnded).diff(lease.leaseEffectiveDate, 'months');
      }
      for(let i=0; i<lengthOfLease; i++){
         totalRevenue += lease.price
      }
      const customer = await prisma.user.findUnique({
         where: {
            id: lease.customerId
         }
      })
      if(customer){
         customers.push(customer)
      }
   }
   const addresses:Address[]=[];
   for await (const customer of customers){
      const address = await prisma.address.findFirst({
         where: {
            userId: customer.id
         }
      })
      if(address){
         addresses.push(address)
      }
   }
   const unitNotesForm = await superValidate(valibot(unitNotesFormSchema));
   const unitPricingForm = await superValidate(valibot(unitPricingFormSchema));
   const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
   return { unit, leases, customers, addresses, unitNotesForm, unitPricingForm, leaseEndForm, totalRevenue };
}) satisfies PageServerLoad;