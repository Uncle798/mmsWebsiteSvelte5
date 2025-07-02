import { prisma } from '$lib/server/prisma';
import { arrayOfYears } from '$lib/server/utils';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const earliestRecord = await prisma.paymentRecord.findFirst({
        orderBy: {
            paymentCreated: 'asc'
        }
    })
    if(!earliestRecord){
        error(404);
    }
    const years = arrayOfYears(earliestRecord!.paymentCreated.getFullYear())
    return {years};
}) satisfies PageServerLoad;