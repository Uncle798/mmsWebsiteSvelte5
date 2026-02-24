import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';
import { deleteRecordFormSchema } from '$lib/formSchemas/deleteRecordFormSchema';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const refundRecordNum = event.params.refundNumber;
   const deleteRecordForm = await superValidate(valibot(deleteRecordFormSchema));
   const refundRecord = await prisma.refundRecord.findUnique({
      where: { 
         refundNumber: parseInt(refundRecordNum, 10)
      },
      include: {
         customer: true,
      },
   });
   const address = await prisma.address.findFirst({
      where: {
         userId: refundRecord?.customerId
      }
   });
   return { refundRecord, address, deleteRecordForm };
}) satisfies PageServerLoad;