import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
//import { valibot } from 'sveltekit-superforms/adapters';
import { valibot } from '$lib/valibot';
import { expenseDeleteFormSchema } from '$lib/formSchemas/expenseDeleteFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { prisma } from '$lib/server/prisma';
import { box } from '$lib/server/box';

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user?.employee) {
			redirect(302, '/login?toast=employee');
		}
		const formData = await event.request.formData();
		const expenseDeleteForm = await superValidate(formData, valibot(expenseDeleteFormSchema));
		if (!expenseDeleteForm.valid) {
			return message(expenseDeleteForm, 'Form not valid');
		}
		const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if (!success) {
			const timeRemaining = Math.floor((reset - Date.now()) / 1000);
			return message(expenseDeleteForm, `Please wait ${timeRemaining}s before trying again.`);
		}
		const { data } = expenseDeleteForm;
		const expense = await prisma.expense.findUnique({
			where: {
				id: data.expenseId
			}
		});
		if (!expense) {
			return message(expenseDeleteForm, 'Expense not found');
		}
		await box.files.deleteFileById(expense.boxFileId);
		await prisma.expense.delete({
			where: {
				id: data.expenseId
			}
		});
		return redirect(302, '/expenses');
	}
};
