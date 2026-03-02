import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
//import { valibot } from "sveltekit-superforms/adapters";
import { valibot } from '$lib/valibot';
import { deleteRecordFormSchema } from '$lib/formSchemas/deleteRecordFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user?.employee) {
			redirect(302, '/login?toast=employee');
		}
		const formData = await event.request.formData();
		const deleteRecordForm = await superValidate(formData, valibot(deleteRecordFormSchema));
		if (!deleteRecordForm.valid) {
			console.log(deleteRecordForm);
			return message(deleteRecordForm, `Form invalid`);
		}
		const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if (!success) {
			const timeRemaining = Math.floor((reset - Date.now()) / 1000);
			return message(deleteRecordForm, `Please wait ${timeRemaining} seconds before trying again.`);
		}
		const { data } = deleteRecordForm;
		switch (data.recordType) {
			case 'invoice':
				const invoice = await prisma.invoice.findUnique({
					where: {
						invoiceNum: data.recordNum
					}
				});
				if (!invoice) {
					return message(deleteRecordForm, 'Invoice not found');
				}
				const payments = await prisma.paymentRecord.findMany({
					where: {
						invoiceNum: invoice.invoiceNum
					}
				});
				if (payments.length > 0) {
					return message(deleteRecordForm, 'Payments must be deleted first');
				}
				await prisma.invoice.delete({
					where: {
						invoiceNum: invoice.invoiceNum
					}
				});
				redirect(308, '/invoices');
			case 'payment':
				const payment = await prisma.paymentRecord.findUnique({
					where: {
						paymentNumber: data.recordNum
					}
				});
				if (!payment) {
					return message(deleteRecordForm, 'Payment record not found');
				}
				const refunds = await prisma.refundRecord.findMany({
					where: {
						paymentRecordNum: payment.paymentNumber
					}
				});
				if (refunds.length > 0) {
					return message(deleteRecordForm, 'Refunds must be deleted first');
				}
				const deleted = await prisma.paymentRecord.delete({
					where: {
						paymentNumber: payment.paymentNumber
					}
				});
				if (deleted) {
					redirect(308, '/paymentRecords');
				}
			case 'refund':
				const refund = await prisma.refundRecord.findUnique({
					where: {
						refundNumber: data.recordNum
					}
				});
				if (!refund) {
					return message(deleteRecordForm, 'Refund record not found');
				}
				await prisma.refundRecord.delete({
					where: {
						refundNumber: refund.refundNumber
					}
				});
				redirect(308, '/refundRecords');
			default:
				break;
		}
	}
};
