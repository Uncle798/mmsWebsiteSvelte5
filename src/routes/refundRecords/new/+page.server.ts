import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma'
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { refundFormSchema } from '$lib/formSchemas/schemas';
import { z } from 'zod';
import { ratelimit } from '$lib/server/rateLimit';

const formSchema = z.object({
   search: z.string().min(0).max(255)
})

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const refundForm = await superValidate(zod(refundFormSchema));
   const searchForm = await superValidate(zod(formSchema));
   const paymentNum = event.url.searchParams.get('paymentNum');
   if(paymentNum){
      const paymentRecord = await prisma.paymentRecord.findUnique({
         where:{
            paymentNumber: parseInt(paymentNum, 10)
         }
      })
      if(!paymentRecord){
         const deposits = await prisma.paymentRecord.findMany({
            where: {
               AND:[
                  { refunded: false },
                  { deposit: true }
               ]
            }
         })
         console.log(deposits.length);
         return { searchForm, refundForm, deposits};
      }
      return { paymentRecord, refundForm, searchForm }
   }
   const deposits = await prisma.paymentRecord.findMany({
      where: {
         AND:[
            {
               refunded: false
            },
            {
               deposit: true
            }
         ]
      },
      orderBy: {
         paymentCreated: 'desc'
      }
   });
   return { deposits, refundForm, searchForm };
}) satisfies PageServerLoad;



export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      console.log('refundRecords/new formData: ', formData);
      const searchForm = await superValidate(formData, zod(formSchema));
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