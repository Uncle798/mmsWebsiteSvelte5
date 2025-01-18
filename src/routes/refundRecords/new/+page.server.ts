import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma'
import { fail, message, superValidate } from 'sveltekit-superforms';
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
      if(!paymentNum){
         return fail(404, searchForm);
      }
      return { paymentRecord, refundForm, searchForm}
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
      const form = await superValidate(formData, zod(formSchema));
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
         const timeRemaining = Math.floor((reset - Date.now()) / 1000);
         return message(form, `Please wait ${timeRemaining} seconds before trying again`);
      }
      if(!form.valid){
         return message(form, 'Unable to process');
      }
      const paymentNum = form.data.search
      redirect(302,`/refundRecords/new?paymentNum=${paymentNum}`)
   }
};