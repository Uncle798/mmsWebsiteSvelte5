import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const unpaidInvoices = await prisma.invoice.findMany({
        where: {
            paymentRecord: null
        }
    })
    return { unpaidInvoices };
}) satisfies PageServerLoad;