import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { cuidIdFormSchema, newDiscountFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const newDiscountForm = await superValidate(valibot(newDiscountFormSchema));
   const discountEndForm = await superValidate(valibot(cuidIdFormSchema));
   const discounts = await prisma.discountCode.findMany({
      where: {
         discountEnded: null
      }
   });
   const discountedLeases = await prisma.lease.findMany({
      where: {
         AND:[
            { leaseEnded: null },
            { discountId: {
               not: null
            }}
         ]
      }
   })
   const customers = await prisma.user.findMany({
      where: {
         AND: [
            { customerLeases: {
               some: {
                  leaseEnded: null
               }
            }},
            { customerLeases: {
               some: {
                  discountId: {
                     not: null
                  }
               }
            }}
         ]
      }
   })
   const demoCookie = event.cookies.get('discounts')
   return { discounts, newDiscountForm, discountEndForm, discountedLeases, customers, demoCookie };
}) satisfies PageServerLoad;