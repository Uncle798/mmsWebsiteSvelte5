// import { prisma } from '$lib/server/prisma';
// import { stripe } from '$lib/server/stripe';
// import type { RequestHandler } from './$types';

// export const POST: RequestHandler = async ({request}) => {
//    const body = await request.json();
//    const { customerId, invoiceNum, subscription } = body;
//    let customer = await prisma.user.findUnique({
//       where: {
//          id: customerId
//       }
//    })
//    if(!customer) {
//       return new Response(JSON.stringify('Customer not found'), { status: 400 })
//    }
//    let stripeId = customer.stripeId
//    if(!stripeId){
//       const customerList = await stripe.customers.list({
//          email: customer!.email!
//       })
//       if(customerList.data.length === 0 ){
//          const stripeCustomer = await stripe.customers.create({
//             name: `${customer.givenName} ${customer.familyName}`,
//             email: customer.email!,
//             metadata: {
//                customerId: customer.id
//             },
//          })
//          customer = await prisma.user.update({
//             where: {
//                id: customer.id
//             },
//             data: {
//                stripeId: stripeCustomer.id
//             }
//          })
//       } else {
//          const stripeCustomer = customerList.data.find((customer) => {
//             customer.email?.includes(customer.email)
//          })
//          if(stripeCustomer){
//             customer = await prisma.user.update({
//                where: {
//                   id: customer.id
//                },
//                data: {
//                   stripeId: stripeCustomer.id
//                }
//             })
//             stripeId = stripeCustomer.id
//          } 
//       }
//    }
//    const invoice = await prisma.invoice.findUnique({
//       where: {
//          invoiceNum: parseInt(invoiceNum, 10)
//       }
//    })
//    if(!invoice){
//       return new Response(JSON.stringify('Invoice not found'), {status: 404});
//    }
   
//    return new Response();
// };