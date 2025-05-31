import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot, zod } from 'sveltekit-superforms/adapters';
import { refundFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const refundForm = await superValidate(valibot(refundFormSchema));
   const searchForm = await superValidate(zod(searchFormSchema));
   const deposits = prisma.paymentRecord.findMany({
      where: {
         AND: [
            { 
               deposit: true
            },
            {
               refunded: false
            }
         ]
      },
      orderBy: {
         paymentCreated: 'desc'
      }
   });
   const customers = prisma.user.findMany({
      where: {
         paymentMade: {
            some: {
               AND: [
                  { deposit: true },
                  { refunded: false }
               ]
            }
         }
      }
   })
   const addresses = prisma.address.findMany({
      where: {
         user: {
            paymentMade: {
               some: {
                  AND: [
                     { deposit: true }, 
                     { refunded: false}
                  ]
               }
            }
         }
      }
   })
   const depositCount = await prisma.paymentRecord.count({
      where: {
         AND: [
            { 
               deposit: true
            },
            {
               refunded: false
            }
         ]
      },
   })
   return { deposits, refundForm, searchForm, depositCount, customers, addresses };
}) satisfies PageServerLoad;