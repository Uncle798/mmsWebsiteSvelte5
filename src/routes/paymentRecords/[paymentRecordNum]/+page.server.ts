import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { RefundRecord } from '@prisma/client';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { paymentRecordDeleteSchema } from '$lib/formSchemas/schemas';
import { sendPaymentReceipt } from '$lib/server/mailtrap';

export const load = (async (event) => {
   const paymentRecordNum = event.params.paymentRecordNum;
   if(!event.locals.user){
      redirect(302, `/login?toast=unauthorized?redirectTo=paymentRecord&paymentRecordNum=${paymentRecordNum}`)
   }
   if(!paymentRecordNum){
      return fail(404)
   }
   if(paymentRecordNum){
      if(event.locals.user.employee){
         const paymentRecord = await prisma.paymentRecord.findUnique({
            where: {
               paymentNumber:parseInt(paymentRecordNum, 10)
            },
         })
         const customer = await prisma.user.findUnique({
            where: {
               id: paymentRecord?.customerId
            }
         });
         const invoice = await prisma.invoice.findUnique({
            where: {
               invoiceNum: paymentRecord?.invoiceNum ? paymentRecord.invoiceNum : undefined
            }
         });
         const address = await prisma.address.findFirst({
            where: {
               AND:[
                  { softDelete: false },
                  { userId: customer?.id },
               ]
            }
         })
         let refundRecord:RefundRecord | null = null;
         if(paymentRecord?.refundNumber){
            refundRecord = await prisma.refundRecord.findUnique({
               where: {
                  refundNumber: paymentRecord.refundNumber
               }
            })
         }
         return { paymentRecord, customer, invoice, refundRecord, address };
      } else {
         const paymentRecord = await prisma.paymentRecord.findUnique({
            where: {
               paymentNumber:parseInt(paymentRecordNum, 10)
            },
         })
         if(paymentRecord?.customerId !== event.locals.user.id){
            fail(400)
         }
         const customer = await prisma.user.findUnique({
            where: {
               id: paymentRecord?.customerId
            }
         });
         const invoice = await prisma.invoice.findUnique({
            where: {
               invoiceNum: paymentRecord?.invoiceNum ? paymentRecord.invoiceNum : undefined
            }
         });
         const address = await prisma.address.findFirst({
            where: {
               AND:[
                  { softDelete: false },
                  { userId: customer?.id },
               ]
            }
         })
         let refundRecord:RefundRecord | null = null;
         if(paymentRecord?.refundNumber){
            refundRecord = await prisma.refundRecord.findUnique({
               where: {
                  refundNumber: paymentRecord.refundNumber
               }
            })
         }
         return { paymentRecord, customer, invoice, refundRecord, address };
      }
   }
   return {}
}) satisfies PageServerLoad;

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData()
      const form = await superValidate(formData, valibot(paymentRecordDeleteSchema));
      if(!form.valid){
         message(form, 'Not a valid form')
      }
      const paymentRecord = await prisma.paymentRecord.findUnique({
         where: {
            paymentNumber: form.data.paymentRecordNumber
         }
      })
      if(!paymentRecord){
         message(form, 'Payment record not found')
      }
      const customer = await prisma.user.findUnique({
         where: {
            id: paymentRecord?.customerId
         }
      })
      if(!customer){
         message(form, 'Customer not found')
      }
      await sendPaymentReceipt(customer!, paymentRecord!)
      return {form}
   }
}