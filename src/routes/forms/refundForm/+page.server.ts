import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { refundFormSchema } from '$lib/formSchemas/schemas';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { stripe } from '$lib/server/stripe';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
    }
    const refundForm = superValidate(zod(refundFormSchema));
    return { refundForm };  
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        if(!event.locals.user?.employee){
            redirect(302, '/login?toast=employee');
        }
        const formData = await event.request.formData();
        console.log('refundForm formData', formData);
        const refundForm = await superValidate(formData, zod(refundFormSchema));
        const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id)
        if(!success){
            const timeRemaining = Math.floor((reset - Date.now()) / 1000);
            return message(refundForm, `Please wait ${timeRemaining} seconds before trying again`);
        }
        if(!refundForm.valid){
            return message(refundForm, 'Unable to process')
        }
        const paymentRecord = await prisma.paymentRecord.findUnique({
            where: {
                paymentNumber: refundForm.data.paymentRecordNumber
            }
        });
        if(!paymentRecord){
            return message(refundForm, 'Payment record not found')
        }
        if(paymentRecord.paymentType === 'STRIPE'){
            const refund = await stripe.refunds.create({
                payment_intent: paymentRecord.stripeId!,
                amount: refundForm.data.amount,
            })
            const refundRecord = await prisma.refundRecord.create({
                data: {
                    stripeId: refund.id,
                    refundAmount: refund.amount,
                    employeeId: event.locals.user.id!,
                    customerId: paymentRecord.customerId,
                    refundType: 'STRIPE',
                    refundNotes: `Refund of payment record number ${paymentRecord.paymentNumber}`,
                    paymentRecordNum: paymentRecord.paymentNumber
                }
            })
            await prisma.paymentRecord.update({
                where: {
                    paymentNumber: paymentRecord.paymentNumber
                },
                data: {
                    refunded: true,
                    refundNumber: refundRecord.refundNumber
                }
            })
            redirect(302, `/refundRecords/${refundRecord.refundNumber}`)
        }
        if(paymentRecord.paymentType === 'CASH' || paymentRecord.paymentType === 'CHECK'){
            
            const refundRecord = await prisma.refundRecord.create({
                data: {
                    customerId: paymentRecord.customerId,
                    paymentRecordNum: paymentRecord.paymentNumber,
                    refundType: refundForm.data.refundType,
                    employeeId: event.locals.user.id!,
                    refundAmount: refundForm.data.amount,
                    refundNotes: refundForm.data.notes
                }
            })
            redirect(302, `/refundRecord/${refundRecord.refundNumber}`)
        }
    }
};