import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitPricingFormSchema } from '$lib/formSchemas/schemas';
import { fail, redirect } from '@sveltejs/kit';
import pricingData from '$lib/server/pricingData';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const unitPricingForm = await superValidate(zod(unitPricingFormSchema));
   const size = event.params.size
   
   const units = prisma.unit.findMany({
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
   const leases = prisma.lease.findMany({
      where: {
         AND: [
            {unit: {
               size,
            }},
            { leaseEnded: null}
         ]
      }
   });
   const customers = prisma.user.findMany({
      where: {
         customerLeases:{
            some: {
               leaseEnded: null
            }
         }
      },
   })
   const addresses = prisma.address.findMany({
      where: {
         user: {
            customerLeases: {
               some: {
                  leaseEnded: null
               }
            }
         }
      }
   })
   const sizes:string[] = [];
   pricingData.forEach((datum) =>{
      sizes.push(datum.size)
   })

   return { units, sizes, unitPricingForm, size, leases, customers, addresses };
}) satisfies PageServerLoad;