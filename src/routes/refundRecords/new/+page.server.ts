import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma'
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { refundFormSchema } from '$lib/formSchemas/refundFormSchema';
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';
import { ratelimit } from '$lib/server/rateLimit';


export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const refundForm = await superValidate(valibot(refundFormSchema));
   const searchForm = await superValidate(valibot(searchFormSchema));
   const paymentNum = event.url.searchParams.get('paymentNum');
   if(paymentNum){
      const paymentRecord = await prisma.paymentRecord.findUnique({
         where:{
            paymentNumber: parseInt(paymentNum, 10)
         }
      })
      const customer = await prisma.user.findUnique({
         where: {
            id: paymentRecord?.customerId
         }
      })
      if(!paymentRecord){
         throw error(404);
      }
      const address = await prisma.address.findFirst({
         where: {
            AND: [
               {userId: customer?.id},
               {softDelete: false}
            ]
         }
      })
      return { paymentRecord, customer, address, refundForm, searchForm }
   }
   const paymentRecords = prisma.paymentRecord.findMany({
      where: {
         refundedAmount: {
            lt: prisma.paymentRecord.fields.paymentAmount
         }
      },
      orderBy: {
         paymentNumber: 'desc'
      }
   })
   const customers = prisma.user.findMany({
      where: {
         paymentMade: {
            some: {
               refundedAmount: {
                  lt: prisma.paymentRecord.fields.paymentAmount
               }
            }
         }
      }
   })
   const addresses = prisma.address.findMany({
      where: {
         AND: [
            {
               user: {
                  paymentMade: {
                     some: {
                        refundedAmount: {
                           lt: prisma.paymentRecord.fields.paymentAmount
                        }
                     }
                  }
               }
            },
            {
               softDelete: false
            }
         ]
      }
   })
   return { paymentRecords, refundForm, searchForm, customers, addresses };
}) satisfies PageServerLoad;



export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      const searchForm = await superValidate(formData, valibot(searchFormSchema));
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(searchForm, `Please wait ${timeRemaining} seconds before trying again`);
      }
      if(!searchForm.valid){
         return message(searchForm, 'Unable to process');
      }
      const paymentNum = searchForm.data.search
      redirect(302,`/refundRecords/new?paymentNum=${paymentNum}`)
   }
};