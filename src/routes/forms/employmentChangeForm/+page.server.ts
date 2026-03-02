import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from '$lib/server/rateLimit';
//import { valibot } from 'sveltekit-superforms/adapters';
import { valibot } from '$lib/valibot';
import { employmentFormSchema } from '$lib/formSchemas/employmentFormSchema';
import { prisma } from '$lib/server/prisma';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user?.admin) {
			redirect(302, '/login?toast=admin');
		}
		const formData = await event.request.formData();
		const employmentChangeForm = await superValidate(formData, valibot(employmentFormSchema));
		const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if (!success) {
			const timeRemaining = Math.floor((reset - Date.now()) / 1000);
			return message(
				employmentChangeForm,
				`Please wait ${timeRemaining} seconds before trying again.`
			);
		}
		if (!employmentChangeForm.valid) {
			return message(employmentChangeForm, 'not valid');
		}
		if (employmentChangeForm.data.userId === event.locals.user.id) {
			return message(employmentChangeForm, 'Unable to change own employment status');
		}
		const { data } = employmentChangeForm;
		const user = await prisma.user.findUnique({
			where: {
				id: data.userId
			}
		});
		if (!user) {
			return message(employmentChangeForm, 'User not found');
		}
		if (data.admin && !user.admin) {
			await prisma.user.update({
				where: {
					id: data.userId
				},
				data: {
					employee: true,
					admin: true
				}
			});
		} else if (data.employee && !user.employee && !user.admin) {
			await prisma.user.update({
				where: {
					id: employmentChangeForm.data.userId
				},
				data: {
					admin: false,
					employee: true
				}
			});
		} else if (user.admin || user.employee) {
			await prisma.user.update({
				where: {
					id: data.userId
				},
				data: {
					admin: false,
					employee: false
				}
			});
		}
		return message(employmentChangeForm, 'Employment changed successfully ');
	}
};
