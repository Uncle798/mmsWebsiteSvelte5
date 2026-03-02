import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Address } from '../../../generated/prisma/client';
import { superValidate } from 'sveltekit-superforms';
//import { valibot } from 'sveltekit-superforms/adapters';
import { valibot } from '$lib/valibot';
import { leaseEndFormSchema } from '$lib/formSchemas/leaseEndFormSchema';
import { alternativeContactFormSchema } from '$lib/formSchemas/alternativeContactFormSchema';
import { alternativeContactRemovalFormSchema } from '$lib/formSchemas/alternativeContactRemovalFormSchema';
import { leaseChangeFormSchema } from '$lib/formSchemas/leaseChangeFormSchema';
import { onboardingCreateManyInvoicesFormSchema } from '$lib/formSchemas/onboardingCreateManyInvoicesFormSchema';
import { leaseDeleteFormSchema } from '$lib/formSchemas/leaseDeleteFormSchema';

export const load = (async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login?toast=unauthorized');
	}
	const leaseId = event.params.leaseId;
	const lease = await prisma.lease.findUnique({
		where: {
			leaseId
		}
	});
	if (!event.locals.user.employee && lease?.customerId !== event.locals.user.id) {
		redirect(302, '/login?toast=employee');
	}
	const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
	const alternativeContactForm = await superValidate(valibot(alternativeContactFormSchema));
	const removeAlternativeContactForm = await superValidate(
		valibot(alternativeContactRemovalFormSchema)
	);
	const leaseChangeForm = await superValidate(valibot(leaseChangeFormSchema));
	const leaseDeleteForm = await superValidate(valibot(leaseDeleteFormSchema));
	const onboardingCreateManyInvoicesForm = await superValidate(
		valibot(onboardingCreateManyInvoicesFormSchema)
	);
	if (!lease) {
		return error(404, {
			message: 'Lease not found'
		});
	}
	const customer = await prisma.user.findUnique({
		where: {
			id: lease?.customerId
		}
	});
	const address = await prisma.address.findUnique({
		where: {
			addressId: lease?.addressId
		}
	});
	let currentAddress: Address | null = null;
	if (address?.softDelete) {
		currentAddress = await prisma.address.findFirst({
			where: {
				userId: customer?.id
			}
		});
	}
	const allAlternativeContacts = await prisma.user.findMany({
		where: {
			alternative: true
		},
		orderBy: {
			familyName: 'asc'
		}
	});
	const alternativeContacts = await prisma.user.findMany({
		where: {
			leaseAlternativeContacts: {
				some: {
					leaseId: lease?.leaseId
				}
			}
		}
	});
	const alternativeContactAddresses = await prisma.address.findMany({
		where: {
			user: {
				leaseAlternativeContacts: {
					some: {
						leaseId: lease?.leaseId
					}
				}
			}
		}
	});
	const invoices = await prisma.invoice.findMany({
		where: {
			leaseId: lease?.leaseId
		},
		orderBy: {
			invoiceDue: 'asc'
		}
	});
	return {
		lease,
		customer,
		address,
		currentAddress,
		leaseEndForm,
		alternativeContactForm,
		removeAlternativeContactForm,
		onboardingCreateManyInvoicesForm,
		leaseDeleteForm,
		leaseChangeForm,
		invoices,
		alternativeContacts,
		alternativeContactAddresses,
		allAlternativeContacts
	};
}) satisfies PageServerLoad;
