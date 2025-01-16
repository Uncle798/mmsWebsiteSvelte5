import { STRIPE_SIGNING_SECRET } from '$env/static/private';
import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types'; 
import type { Invoice } from '@prisma/client';


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
                  const paymentRecord = await prisma.paymentRecord.create({
                     data: {
                        invoiceNum: invoice!.invoiceNum,
                        customerId: customerId,
                        paymentAmount: intent.amount / 100,
                        paymentType: 'STRIPE',
                        stripeId: intent.id,
                        unitNum: intent.metadata.unitNum,
                        paymentNotes: `Payment for invoice number: ${invoice?.invoiceNum}`,
                        deposit: invoice?.deposit,
                     }
                  })
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
               handlePaymentIntent(paymentIntent);
               return new Response(JSON.stringify('ok'), {status: 200});
            }
            case 'payment_intent.succeeded':{
               const paymentIntent = stripeEvent.data.object;
               const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
                  await prisma.paymentRecord.update({
                     where: {
                        stripeId: intent.id,
                     },
                     data: {
                        paymentCompleted: new Date,
                        paymentAmount: intent.amount_received / 100,
                     }
                  })
               }
               handlePaymentIntent(paymentIntent);
               return new Response(JSON.stringify('ok'), {status: 200});

            }
            case 'charge.succeeded': {
               const charge = stripeEvent.data.object;
               console.log('stripe webhooks charge succeeded', charge)
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