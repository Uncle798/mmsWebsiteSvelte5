import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { superValidate, message,} from 'sveltekit-superforms';
import { prisma } from '$lib/server/prisma';
import { ratelimit } from '$lib/server/rateLimit';
import { valibot } from 'sveltekit-superforms/adapters';
import { newPaymentRecordFormSchema } from '$lib/formSchemas/schemas';
import { Prisma, type Invoice } from '@prisma/client';


export const actions:Actions = {
   default: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const newPaymentRecordForm = await superValidate(formData, valibot(newPaymentRecordFormSchema));
      const {success, reset} = await ratelimit.employeeForm.limit(event.locals.user.id);
      if(!success){
            const timeRemaining = Math.floor((reset - Date.now()) / 1000);
            return message(newPaymentRecordForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      if(!newPaymentRecordForm.valid){
         return message(newPaymentRecordForm, 'Unable to process')
      }
      const data = newPaymentRecordForm.data;
      let invoice: Invoice | null = null
      if(data.invoiceNum){
         invoice = await prisma.invoice.findFirst({
            where: {
               invoiceNum: data.invoiceNum,
            }
         })
      }
      if(data.paymentType === 'CASH' || data.paymentType === 'CHECK'){
         const paymentRecord = await prisma.paymentRecord.create({
            data: {
               paymentAmount: data.paymentAmount,
               payee: data.payee,
               customerId: data.customerId,
               employeeId: data.employeeId,
               invoiceNum: data.invoiceNum,
               paymentCompleted: new Date(),
               paymentType: data.paymentType,
               paymentNotes: data.paymentNotes,
               deposit: newPaymentRecordForm.data.deposit
            }  
         })
         if(invoice){
            invoice = await prisma.invoice.update({
               where: {
                  invoiceNum: invoice.invoiceNum,
               },
               data: {
                  amountPaid: (invoice.amountPaid + paymentRecord.paymentAmount)
               }
            })
         }
         redirect(302, '/paymentRecords/' + paymentRecord.paymentNumber)
      }
      
      if(data.paymentType === 'CREDIT'){
         redirect(302, '/makePayment?invoiceNum='+data.invoiceNum)
      }
      return { newPaymentRecordForm }
   }
};