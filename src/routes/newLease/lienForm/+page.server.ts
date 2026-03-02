import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
//import { valibot } from 'sveltekit-superforms/adapters';
import { valibot } from '$lib/valibot';
import { propertySubjectToLienSchema } from '$lib/formSchemas/propertySubjectToLienSchema';
import { prisma } from '$lib/server/prisma';
import type { PropertyWithLien } from '../../../generated/prisma/client';

export const load = (async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login?toast=unauthorized');
	}
	const leaseId = event.url.searchParams.get('leaseId');
	const invoiceNum = event.url.searchParams.get('invoiceNum');
	const propertyIds = event.url.searchParams.getAll('propertyId');
	if (!leaseId) {
		return error(400, 'LeaseId not provided');
	}
	const lienForm = await superValidate(valibot(propertySubjectToLienSchema));
	const lease = await prisma.lease.findUnique({
		where: {
			leaseId
		}
	});
	if (!lease) {
		return error(404, 'Lease not found');
	}
	const properties: PropertyWithLien[] = [];
	for (const propertyId of propertyIds) {
		const property = await prisma.propertyWithLien.findUnique({
			where: {
				id: propertyId
			}
		});
		if (property) {
			properties.push(property);
		}
	}
	return { lienForm, lease, properties, invoiceNum };
}) satisfies PageServerLoad;
