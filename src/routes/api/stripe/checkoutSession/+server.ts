// import { PUBLIC_URL } from '$env/static/public';
// import { prisma } from '$lib/server/prisma';
// import { stripe } from '$lib/server/stripe';
// import dayjs from 'dayjs';
// import type { RequestHandler } from './$types';

// export const POST: RequestHandler = async (event) => {
//    const body = await event.request.json();
//    const {  subscription, invoiceNum, newLease, leaseId } = body;
//    if(!invoiceNum){
//       return new Response(JSON.stringify('invoiceNum not provided'), { status: 400});
//    }
//    const invoice = await prisma.invoice.findUnique({
//       where: {
//          invoiceNum: parseInt(invoiceNum, 10)
//       }
//    })
//    if(!invoice){
//       return new Response(JSON.stringify('invoice not found'), { status: 404 });
//    }
//    const customer = await prisma.user.findUnique({
//       where: {
//          id: invoice!.customerId
//       }
//    });
//    if(!customer){
//       return new Response(JSON.stringify('Customer not found'), { status:404 });
//    }
//    const previousSessions = await stripe.checkout.sessions.list({
//       customer: customer.stripeId ? customer.stripeId : undefined,
//       status: 'open'
//    })
//    console.log(previousSessions);
//    if(previousSessions){
//       for(const session of previousSessions.data){
//          await stripe.checkout.sessions.expire(session.id)
//       }
//    }
//    if(subscription){  
//       if(!invoice.leaseId){
//          return new Response(JSON.stringify('LeaseId not provided'), { status:400 });
//       }
//       const lease = await prisma.lease.findUnique({
//          where: {
//             leaseId: invoice.leaseId
//          }
//       });
//       if(!lease){
//          return new Response(JSON.stringify('Lease not found'), { status:404 });
//       }
//       const session = await stripe.checkout.sessions.create({
//          currency: 'usd',
//          customer: customer?.stripeId ? customer.stripeId : undefined,
//          mode: 'subscription',
//          ui_mode: 'embedded',
//          return_url: `${PUBLIC_URL}/thanks?customerId=${customer.id}`,
//          line_items: [
//             {
//                price_data: {
//                   currency: 'usd',
//                   recurring: {
//                      interval: 'month'
//                   },
//                   unit_amount: lease!.price * 100, 
//                   product_data: {
//                      name: `Monthly rent for unit number ${lease.unitNum.replace(/^0+/gm,'')}`,
//                      metadata: {
//                         leaseId: lease.leaseId,
//                         customerId: customer.id,
//                         newLease,
//                      }
//                   }
//                },
//                quantity: 1,
//             }
//          ],
//          metadata: {
//             customerId: customer.id
//          }
//       })
//       return new Response(JSON.stringify(session.client_secret), { status: 200 });
//    } else {
//       let returnUrl = `${PUBLIC_URL}/thanks?customerId=${customer.id}`;
//       if(newLease){
//          returnUrl = `${PUBLIC_URL}/newLease/leaseSent?leaseId=${leaseId}`;
//       }
//       const session = await stripe.checkout.sessions.create({
//          currency: 'usd',
//          customer: customer.stripeId ? customer.stripeId : undefined,
//          mode: 'payment',
//          ui_mode: 'embedded',
//          expires_at: newLease ? dayjs().add(30, 'minute').unix() : undefined, 
//          return_url: returnUrl,
//          line_items: [
//             {
//                price_data: {
//                   currency: 'usd',
//                   unit_amount: invoice!.invoiceAmount * 100,
//                   product_data:{
//                      name: `Payment for invoice number: ${invoice.invoiceNum}`,
//                      metadata: {
//                         invoiceNum,
//                         customerId: customer.id,
//                      }
//                   }
//                },
//                quantity: 1,
//             }
//          ],
//          metadata: {
//             leaseId,
//             newLease,
//             invoiceNum
//          },
//       })
//       return new Response(JSON.stringify(session.client_secret), { status: 200 });
//    }
// };