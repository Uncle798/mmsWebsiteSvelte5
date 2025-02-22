import { STRIPE_SIGNING_SECRET } from '$env/static/private';
import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types'; 
import type { Invoice, PaymentRecord } from '@prisma/client';


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
               console.log(paymentIntent);
               const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
                  let invoice:Invoice | null = null
                  const customerId = intent.metadata.customerId

                  if(intent.metadata.invoiceNum){
                     invoice = await prisma.invoice.findFirst({
                        where: {
                           invoiceNum: parseInt(intent.metadata.invoiceNum, 10),
                        }
                     });
                  } else {
                     invoice = await prisma.invoice.create({
                        data: {
                           invoiceAmount: intent.amount,
                           customerId: customerId,
                           invoiceNotes: intent.description,
                        }
                     })
                     await stripe.paymentIntents.update(paymentIntent.id, {
                        metadata: {
                           invoiceNum: invoice.invoiceNum
                        }
                     })
                  }
                  console.log('stripe webhooks invoice: ', invoice?.invoiceNum)
                  let paymentRecord:PaymentRecord = {} as PaymentRecord
                  try {                     
                     paymentRecord = await prisma.paymentRecord.create({
                        data: {
                           invoiceNum: invoice!.invoiceNum,
                           customerId: customerId,
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
                     await prisma.invoice.update({
                        where: {
                           invoiceNum: invoice?.invoiceNum
                        },
                        data: {
                           paymentRecordNum: paymentRecord.paymentNumber
                        }
                     })
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
               // const charge = stripeEvent.data.object;
               // console.log('stripe webhooks charge succeeded', charge)
               // const handleCharge = async (c: typeof charge) =>{
               //    await prisma.paymentRecord.update({
               //       where: {
               //          stripeId: c.payment_intent?.toString()
               //       },
               //       data:{
               //          paymentCompleted: new Date(),
               //       }
               //    })

               // }
               // handleCharge(charge);
               return new Response(JSON.stringify('ok'), {status: 200})
            }
            case 'refund.failed':{
               const refund = stripeEvent.data.object;
               console.log('stripe webhooks refund failed', refund)
               return new Response(JSON.stringify('ok'), {status: 200}); 
            }
            case 'refund.created': {
               const refund = stripeEvent.data.object;
               console.log('stripe webhooks refund created', refund)
               return new Response(JSON.stringify('ok'), {status: 200}); 
            }
            case 'refund.updated': {
               const refund = stripeEvent.data.object;
               prisma.refundRecord.update({
                  where: {
                     stripeId: refund.id
                  },
                  data: {
                     refundAmount: refund.amount,
                     
                  }
               })
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