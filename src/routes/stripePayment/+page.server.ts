// import { redirect,  error } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
// import { prisma } from '$lib/server/prisma';
// import { stripe } from '$lib/server/stripe';

// export const load:PageServerLoad = (async (event) => {
//    if(!event.locals.user){
//       redirect(302, '/login?toast=unauthorized')
//    }
//    const invoiceNum = event.url.searchParams.get('invoiceNum');
//    const newLease = event.url.searchParams.get('newLease');
//    const subscription = event.url.searchParams.get('subscription');
//    const leaseId = event.url.searchParams.get('leaseId')
//    if(!invoiceNum){
//       throw error(400, 'No invoice number provided')
//    }
//    const invoice = await prisma.invoice.findUnique({
//       where: {
//          invoiceNum:parseInt(invoiceNum!, 10),
//       }
//    })
//    if(!invoice){
//       throw error(400, 'No invoice found')
//    }
//    const customer = await prisma.user.findFirst({
//       where: {
//          id: invoice.customerId!, 
//       }
//    })
//    const stripeId = event.url.searchParams.get('stripeId');
//    const sessionsList = await stripe.checkout.sessions.list({status:'open'});
//    if(sessionsList){
//       for(const session of sessionsList.data){
//          console.log(session)
//          if(session.customer?.toString() === customer?.stripeId){
//             console.log(session)
//             await stripe.checkout.sessions.expire(session.id)
//          }
//       }
//    }
//    return { invoice, stripeId, customer, newLease, subscription, leaseId };
// })
