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
               console.log('paymentIntent ', paymentIntent)
               const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
                  let invoice:Invoice | null = null
                  const customer = await prisma.user.findFirst({
                     where: {
                        stripeId: intent.customer!.toString()
                     }
                  })
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
                           customerId: customer?.id,
                           invoiceNotes: intent.description,
                        }
                     })
                  }
                  const paymentRecord = await prisma.paymentRecord.create({
                     data: {
                        invoiceNum: invoice!.invoiceNum,
                        customerId: customer!.id,
                        paymentAmount: intent.amount / 100,
                        paymentType: 'STRIPE',
                        stripeId: intent.id,
                        unitNum: intent.metadata.unitNum,
                        payee: `${customer?.givenName} ${customer?.familyName}`,
                        paymentNotes: `Payment for invoice number: ${invoice?.invoiceNum}`
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
            default:
               break;
         }
      }
   }
   return new Response(JSON.stringify('ok'), {status: 200});
};