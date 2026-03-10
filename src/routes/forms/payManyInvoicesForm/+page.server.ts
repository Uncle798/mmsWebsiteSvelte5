import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
//import { valibot } from 'sveltekit-superforms/adapters';
import { valibot } from '$lib/valibot';
import { payManyInvoicesFormSchema } from '$lib/formSchemas/payManyInvoicesFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user?.employee) {
			redirect(302, '/login?toast=employee');
		}
		const formData = await event.request.formData();
		const payManyInvoicesForm = await superValidate(formData, valibot(payManyInvoicesFormSchema));
		if (!payManyInvoicesForm.valid) {
			console.log(payManyInvoicesForm);
			return message(payManyInvoicesForm, 'Form invalid');
		}
		const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if (!success) {
			const timeRemaining = Math.floor((reset - Date.now()) / 1000);
			return message(payManyInvoicesForm, `Please wait ${timeRemaining}s before trying again.`);
		}
		const { data } = payManyInvoicesForm;
		if (data.paymentType !== 'CREDIT') {
			let paidAmount = data.paymentAmount;
			const invoices = await prisma.invoice.findMany({
				where: {
					AND: [
						{ customerId: data.customerId },
						{
							invoiceAmount: {
								gt: prisma.invoice.fields.amountPaid
							}
						}
					]
				},
				orderBy: {
					invoiceDue: 'asc'
				}
			});
			if (invoices.length < 1) {
				return message(payManyInvoicesForm, 'No invoice found');
			}
			console.log('paidAmount:', paidAmount);
			for (const invoice of invoices) {
				if(paidAmount > 0 && invoice.invoiceAmount - invoice.amountPaid < paidAmount) {
					const payment = await prisma.paymentRecord.create({
						data: {
							invoiceNum: invoice.invoiceNum,
							employeeId: event.locals.user.id,
							customerId: invoice.customerId,
							paymentAmount: invoice.invoiceAmount - invoice.amountPaid,
							paymentType: data.paymentType,
							paymentNotes: `Payment for invoice ${invoice.invoiceNum} ${invoice.invoiceNotes}`,
							paymentCompleted: new Date()
						}
					});
					await prisma.invoice.update({
						where: {
							invoiceNum: invoice.invoiceNum
						},
						data: {
							amountPaid: invoice.amountPaid + payment.paymentAmount
						}
					});
					paidAmount -= payment.paymentAmount;
				console.log('paidAmount:', paidAmount);
				} else if (paidAmount > 0 && invoice.invoiceAmount - invoice.amountPaid >= paidAmount) {
					const payment = await prisma.paymentRecord.create({
						data: {
							invoiceNum: invoice.invoiceNum,
							employeeId: event.locals.user.id,
							customerId: invoice.customerId,
							paymentAmount: paidAmount,
							paymentType: data.paymentType,
							paymentNotes: `Payment for invoice ${invoice.invoiceNum} ${invoice.invoiceNotes}`,
							paymentCompleted: new Date()
						}
					});
					await prisma.invoice.update({
						where: {
							invoiceNum: invoice.invoiceNum
						},
						data: {
							amountPaid: invoice.amountPaid + payment.paymentAmount
						}
					});
					paidAmount -= payment.paymentAmount;
					console.log('paidAmount:', paidAmount);
				}
			}
			return message(payManyInvoicesForm, 'Payments created');
		} else {
			// do credit processing
		}
	}
};
