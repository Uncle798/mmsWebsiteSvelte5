import { prisma } from '$lib/server/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { paymentRecordDeleteSchema } from '$lib/formSchemas/schemas';

export const load = (async () => {
   const paymentRecords = await prisma.paymentRecord.findMany({
      where: {
         paymentCompleted: null
      },
      orderBy: {
         paymentNumber: 'desc'
      }
   })
   const paymentRecordDeleteForm = await superValidate(zod(paymentRecordDeleteSchema));
   return { paymentRecords, paymentRecordDeleteForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) =>{
      const formData = await event.request.formData();
      const paymentRecordDeleteForm = await superValidate(formData, zod(paymentRecordDeleteSchema));
      if(!paymentRecordDeleteForm.valid){
         fail(404, paymentRecordDeleteForm)
      }
      const paymentRecord = await prisma.paymentRecord.findUnique({
         where: {
            paymentNumber: paymentRecordDeleteForm.data.paymentRecordNumber
         }
      })
      if(paymentRecord){
         await prisma.paymentRecord.delete({
            where: {
               paymentNumber: paymentRecordDeleteForm.data.paymentRecordNumber
            }
         })
      }
      return { paymentRecordDeleteForm }
   } 
};