import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
//import { valibot } from 'sveltekit-superforms/adapters';
import { valibot } from '$lib/valibot';
import { leaseUploadFormSchema } from '$lib/formSchemas/leaseUploadFormSchema';
import { ratelimit } from '$lib/server/rateLimit';
import { put, list, type ListBlobResultBlob } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import dayjs from 'dayjs';

export const load = (async (event) => {
	if (!event.locals.user?.employee) {
		return redirect(302, '/login?toast=employee');
	}
	const leaseUploadForm = await superValidate(valibot(leaseUploadFormSchema));
	const templatesList = await list({ token: BLOB_READ_WRITE_TOKEN });
	const blobs: ListBlobResultBlob[] = [];
	for (const blob of templatesList.blobs) {
		blobs.push(blob);
	}
	return { leaseUploadForm, blobs };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user?.employee) {
			return redirect(302, '/login?toast=employee');
		}
		const formData = await event.request.formData();
		const leaseUploadForm = await superValidate(formData, valibot(leaseUploadFormSchema));
		if (!leaseUploadForm.valid) {
			console.error(leaseUploadForm);
			return message(leaseUploadForm, 'Form invalid');
		}
		const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if (!success) {
			const timeRemaining = Math.floor((reset - Date.now()) / 1000);
			return message(leaseUploadForm, `Please wait ${timeRemaining}s before trying again.`);
		}
		const { data } = leaseUploadForm;
		await put(`MMS Lease ${dayjs().format('hh-mm-ss-MM-DD-YYYY')}.pdf`, data.lease, {
			access: 'public',
			token: BLOB_READ_WRITE_TOKEN
		});
		return message(leaseUploadForm, 'File uploaded');
	}
};
