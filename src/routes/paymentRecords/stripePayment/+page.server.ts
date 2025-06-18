// import { prisma } from '$lib/server/prisma';
// import { fail } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';

// export const load = (async (event) => {
//     const invoiceNum = event.url.searchParams.get('invoiceNum');
//     if(!invoiceNum){
//         return fail(404)
//     }
//     const paymentRecord = await prisma.paymentRecord.findFirst({
//         where: {
//             AND: [
//                 {invoiceNum: parseInt(invoiceNum, 10)},
//                 {paymentCompleted: null}
//             ]
//         },
//     })
//     return { paymentRecord };
// }) satisfies PageServerLoad;