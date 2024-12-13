import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
    if(!event.locals.user?.employee){
        redirect(302, '/login?toast=employee')
     }
    const unpaidInvoices = await prisma.invoice.findMany({
        where: {
            paymentRecord: null
        }, 
        include: {
            customer: true
        },
        orderBy: {
            invoiceCreated: 'asc'
        }
    })
    return { unpaidInvoices };
}) satisfies PageServerLoad;