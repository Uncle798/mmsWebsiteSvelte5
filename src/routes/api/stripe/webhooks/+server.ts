import { STRIPE_SIGNING_SECRET } from '$env/static/private';
import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types'; 
import type { Invoice, PaymentRecord, User } from '@prisma/client';

export const POST: RequestHandler = async (event) => {
   if(STRIPE_SIGNING_SECRET){
      const signature = event.request.headers.get('stripe-signature');
      let stripeEvent;
      if(signature){
         try {
            const body = await event.request.text();
            stripeEvent = stripe.webhooks.constructEvent(
               body, 
               signature, 
               STRIPE_SIGNING_SECRET
            );
         } catch (err) {
            console.error(err);

         }
         switch (stripeEvent?.type) {
            case 'payment_intent.created': {
               const paymentIntent = stripeEvent.data.object;
               const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
                  let invoice:Invoice | null = null
                  const customerId = intent.customer?.toString()
                  let customer:User | null = null 
                  try {
                     customer = await prisma.user.findFirst({
                        where: {
                           stripeId: customerId
                        }
                     })
                  } catch (error) {
                     console.error(error)
                  }
                  if(!customer){
                     return;
                  }
                  if(intent.metadata.invoiceNum){
                     try {                        
                        invoice = await prisma.invoice.findUnique({
                           where: {
                              invoiceNum: parseInt(intent.metadata.invoiceNum, 10),
                           }
                        });
                     } catch (error) {
                        console.error(error)
                     }
                  } else {
                     try {
                        invoice = await prisma.invoice.create({
                           data: {
                              invoiceAmount: intent.amount,
                              customerId: customer?.id,
                              invoiceNotes: intent.description,
                              stripeId: intent.invoice?.toString()
                           }
                        })
                     } catch (error) {
                        console.error(error)
                     }
                     await stripe.paymentIntents.update(paymentIntent.id, {
                        metadata: { 
                           invoiceNum: invoice?.invoiceNum ? invoice.invoiceNum : null
                        }
                     })
                  }
                  let paymentRecord:PaymentRecord | null = null
                  try {                     
                     paymentRecord = await prisma.paymentRecord.create({
                        data: {
                           invoiceNum: invoice!.invoiceNum,
                           customerId: customer!.id,
                           paymentAmount: intent.amount / 100,
                           paymentType: 'STRIPE',
                           stripeId: intent.id,
                           unitNum: intent.metadata.unitNum,
                           paymentNotes: `Payment for invoice number: ${invoice?.invoiceNum}, ${invoice?.invoiceNotes}`,
                           deposit: invoice?.deposit,
                        }
                     })
                  } catch (error) {
                     console.error(error)
                  }
                  if(paymentRecord){
                     try {
                        await prisma.invoice.update({
                           where: {
                              invoiceNum: invoice?.invoiceNum
                           },
                           data: {
                              paymentRecordNum: paymentRecord.paymentNumber
                           }
                        })
                     } catch (error) {
                        console.log(error)
                     }
                     await stripe.paymentIntents.update(intent.id, {
                        metadata: {
                           paymentNum: paymentRecord.paymentNumber
                        }
                     })
                  }
               }
               handlePaymentIntent(paymentIntent);
               return new Response(JSON.stringify('ok'), {status: 200});
            }
            case 'customer.subscription.created': {
               const subscription = stripeEvent.data.object;
               console.log('subscription', subscription.items);
               const handleSubscription = async (s: typeof subscription)=>{
                  const customer = await prisma.user.findFirst({
                     where: {
                        stripeId: s.customer.toString()
                     }
                  })
                  console.log(customer)
               }
               handleSubscription(subscription);
               return new Response(JSON.stringify('ok'), {status:200})
            }
            case 'payment_intent.succeeded':{
               const paymentIntent = stripeEvent.data.object;
               console.log(paymentIntent);
               const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
                  try {                
                     const paymentRecord = await prisma.paymentRecord.update({
                        where: {
                           stripeId: intent.id,
                        },
                        data: {
                           paymentCompleted: new Date,
                           paymentAmount: intent.amount_received / 100,
                        }
                     })
                     console.log('payment_intent.succeeded ' + paymentRecord?.paymentCompleted)
                  } catch (error) {
                     console.error(error)
                  }
               }
               handlePaymentIntent(paymentIntent);
               return new Response(JSON.stringify('ok'), {status: 200});

            }
            case 'charge.succeeded': {
               const charge = stripeEvent.data.object;
               console.log('stripe webhooks charge succeeded', charge)
               const handleCharge = async (c: typeof charge) =>{
                  try {                     
                     await prisma.paymentRecord.update({
                        where: {
                           stripeId: c.payment_intent?.toString()
                        },
                        data:{
                           paymentCompleted: new Date(),
                        }
                     })
                  } catch (error) {
                     console.error(error)
                  }

               }
               handleCharge(charge);
               return new Response(JSON.stringify('ok'), {status: 200})
            }
            case 'refund.failed':{
               const refund = stripeEvent.data.object;
               const handleRefund = async (r: typeof refund) => {
                  await prisma.refundRecord.update({
                     where: {
                        stripeId: r.id
                     },
                     data: {
                        refundAmount: r.amount,
                        refundCompleted: null
                     }
                  })
               }
               handleRefund(refund);
               console.log('stripe webhooks refund failed', refund)
               return new Response(JSON.stringify('ok'), {status: 200}); 
            }
            case 'refund.created': {
               const refund = stripeEvent.data.object;
               const handleRefund = async (r: typeof refund) =>{
                  let paymentRecord:PaymentRecord | null = null
                  try {
                     paymentRecord = await prisma.paymentRecord.findFirst({
                        where: {
                           stripeId: refund.payment_intent?.toString()
                        }
                     }) 
                  } catch (error) {
                     console.error(error)
                  }
                  if(paymentRecord){
                     await prisma.refundRecord.create({
                        data: {
                           paymentRecordNum: paymentRecord?.paymentNumber,
                           customerId: paymentRecord.customerId,
                           refundAmount: r.amount,
                           stripeId: r.id,
                           refundType: 'STRIPE'
                        }
                     })
                  }
               }
               handleRefund(refund);
               console.log('stripe webhooks refund created', refund);

               return new Response(JSON.stringify('ok'), {status: 200}); 
            }
            case 'refund.updated': {
               const refund = stripeEvent.data.object;
               const handleRefund = async (r: typeof refund) => {
                  if(r.status === 'succeeded'){
                     await prisma.refundRecord.update({
                        where: {
                           stripeId: refund.id
                        },
                        data: {
                           refundAmount: refund.amount,
                           refundCompleted: new Date()
                        }
                     })
                  }
               }
               handleRefund(refund)
               return new Response(JSON.stringify('ok'), {status: 200}); 
            }
            default:
               console.log('stripe webhooks event type: ', stripeEvent?.type)
               break;
         }
      }
   }
   return new Response(JSON.stringify('ok'), {status: 200});
};