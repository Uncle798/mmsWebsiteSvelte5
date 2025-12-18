import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
    if(!event.locals.user.employee){
        redirect(302, '/login?toast=employee');
    }
    const expenses = await prisma.expense.findMany({
        orderBy: {
            createdAt: 'asc'
        }
    });
    const employees = await prisma.user.findMany({
        where: {
            employee: true,
        }
    });
    const vendors = await prisma.user.findMany({
        where: {
            vendor: true 
        }
    })
    return { expenses, employees, vendors, };
}) satisfies PageServerLoad;