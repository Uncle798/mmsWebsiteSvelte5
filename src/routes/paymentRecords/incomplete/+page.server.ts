import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { paymentRecordDeleteSchema } from '$lib/formSchemas/paymentRecordDeleteSchema';
import { error } from '@sveltejs/kit';

export const load = (async () => {
   const paymentRecords = await prisma.paymentRecord.findMany({
      where: {
         paymentCompleted: null
      },
      orderBy: {
         paymentNumber: 'desc'
      }
   })
   const paymentRecordDeleteForm = await superValidate(valibot(paymentRecordDeleteSchema));
   return { paymentRecords, paymentRecordDeleteForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) =>{
      const formData = await event.request.formData();
      const paymentRecordDeleteForm = await superValidate(formData, valibot(paymentRecordDeleteSchema));
      if(!paymentRecordDeleteForm.valid){
         error(404)
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