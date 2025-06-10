import { STRIPE_SIGNING_SECRET } from '$env/static/private';
import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types'; 
import type { Invoice, Lease, PaymentRecord, User } from '@prisma/client';

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
            case 'checkout.session.expired': {
               const session = stripeEvent.data.object;
               const handleSessionExpire = async (s: typeof session) => {
                  if(s.metadata?.newLease){
                     const lease = await prisma.lease.findUnique({
                        where: {
                           leaseId: s.metadata.leaseId,
                        }
                     })
                     if(lease){
                        const invoices = await prisma.invoice.findMany({
                           where: {
                              leaseId: lease?.leaseId
                           }
                        })
                        if(invoices){
                           await prisma.invoice.deleteMany({
                              where: {
                                 leaseId: lease.leaseId
                              }
                           })
                        }
                        await prisma.lease.delete({
                           where: {
                              leaseId: lease.leaseId
                           }
                        })
                     }
                  }
               }
               handleSessionExpire(session);
               return new Response(JSON.stringify('ok'), {status: 200});
            }
            case 'checkout.session.completed': {
               const checkoutSession = stripeEvent.data.object;
               const handleSession = async (session: typeof checkoutSession) => {
                  if(session.metadata?.invoiceNum){
                     const invoice = await prisma.invoice.findUnique({
                        where: {
                           invoiceNum: parseInt(session.metadata.invoiceNum, 10)
                        }
                     })
                     if(invoice){
                        const paymentRecord = await prisma.paymentRecord.create({
                           data: {
                              paymentAmount: session.amount_total ? session.amount_total / 100 : 0,
                              customerId: invoice.customerId,
                              invoiceNum: invoice.invoiceNum,
                              paymentType: 'CREDIT',
                              paymentNotes: `Payment for invoice number ${invoice.invoiceNum}, ${invoice.invoiceNotes}`,
                              deposit: invoice.deposit,
                              transactionId: session.id,
                           }
                        })
                        console.log(paymentRecord)
                        await prisma.invoice.update({
                           where: {
                              invoiceNum: invoice.invoiceNum,
                           },
                           data: {
                              paymentRecordNum: paymentRecord.paymentNumber
                           }
                        })
                     }
                  }
               }
               handleSession(checkoutSession)
               return new Response(JSON.stringify('ok'), {status:200})
            }
            // case 'payment_intent.created': {
            //    const paymentIntent = stripeEvent.data.object;
            //    console.log(paymentIntent)
            //    const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
            //       let invoice:Invoice | null = null
            //       const customerId = intent.customer?.toString()
            //       let customer:User | null = null 
            //       try {
            //          customer = await prisma.user.findFirst({
            //             where: {
            //                stripeId: customerId
            //             }
            //          })
            //       } catch (error) {
            //          console.error(error)
            //       }
            //       if(!customer){
            //          return;
            //       }
            //       if(intent.metadata.invoiceNum){
            //          try {                        
            //             invoice = await prisma.invoice.findUnique({
            //                where: {
            //                   invoiceNum: parseInt(intent.metadata.invoiceNum, 10),
            //                }
            //             });
            //          } catch (error) {
            //             console.error(error)
            //          }
            //       } else {
            //          try {
            //             invoice = await prisma.invoice.create({
            //                data: {
            //                   invoiceAmount: intent.amount,
            //                   customerId: customer?.id,
            //                   invoiceNotes: intent.description,
            //                   stripeId: intent.invoice?.toString()
            //                }
            //             })
            //          } catch (error) {
            //             console.error(error)
            //          }
            //          await stripe.paymentIntents.update(paymentIntent.id, {
            //             metadata: { 
            //                invoiceNum: invoice?.invoiceNum ? invoice.invoiceNum : null
            //             }
            //          })
            //       }
            //       let paymentRecord:PaymentRecord | null = null
            //       try {                     
            //          paymentRecord = await prisma.paymentRecord.create({
            //             data: {
            //                invoiceNum: invoice!.invoiceNum,
            //                customerId: customer!.id,
            //                paymentAmount: intent.amount / 100,
            //                paymentType: 'STRIPE',
            //                stripeId: intent.id,
            //                unitNum: intent.metadata.unitNum,
            //                paymentNotes: `Payment for invoice number: ${invoice?.invoiceNum}, ${invoice?.invoiceNotes}`,
            //                deposit: invoice?.deposit,
            //             }
            //          })
            //       } catch (error) {
            //          console.error(error)
            //       }
            //       if(paymentRecord){
            //          try {
            //             await prisma.invoice.update({
            //                where: {
            //                   invoiceNum: invoice?.invoiceNum
            //                },
            //                data: {
            //                   paymentRecordNum: paymentRecord.paymentNumber
            //                }
            //             })
            //          } catch (error) {
            //             console.error(error)
            //          }
            //          await stripe.paymentIntents.update(intent.id, {
            //             metadata: {
            //                paymentNum: paymentRecord.paymentNumber
            //             }
            //          })
            //       }
            //    }
            //    handlePaymentIntent(paymentIntent);
            //    return new Response(JSON.stringify('ok'), {status: 200});
            // }
            case 'payment_intent.canceled': {
               const paymentIntent = stripeEvent.data.object;
               const handlePaymentIntent = async (intent: typeof paymentIntent) => {
                  const invoice = await prisma.invoice.findUnique({
                     where: {
                        invoiceNum: parseInt(intent.metadata.invoiceNum, 10),
                     }
                  });
                  if(invoice){
                     if(invoice.paymentRecordNum){
                        const paymentRecord = await prisma.paymentRecord.findUnique({
                           where: {
                              paymentNumber: invoice.paymentRecordNum
                           }
                        })
                        if(paymentRecord){
                           await prisma.paymentRecord.delete({
                              where: {
                                 paymentNumber: paymentRecord.paymentNumber
                              }
                           })
                        }
                     }
                     await prisma.invoice.delete({
                        where: {
                           invoiceNum: invoice.invoiceNum
                        }
                     })
                     if(invoice.leaseId){
                        const leaseInvoices = await prisma.invoice.findMany({
                           where: {
                              leaseId: invoice.leaseId
                           }
                        })
                        if(!leaseInvoices){
                           const lease = await prisma.lease.findUnique({
                              where: {
                                 leaseId: invoice.leaseId
                              }
                           })
                           if(lease){
                              await prisma.lease.delete({
                                 where: {
                                    leaseId: lease.leaseId
                                 }
                              })
                           }
                        }
                     }
                  }
               }
               handlePaymentIntent(paymentIntent);
               return new Response(JSON.stringify('ok'), {status:200});
            }
            case 'customer.subscription.created': {
               const subscription = stripeEvent.data.object;
               const handleSubscription = async (s: typeof subscription)=>{
                  let lease: Lease | null = null
                  if(s.metadata.leaseId){
                     lease = await prisma.lease.findFirst({
                        where: {
                           leaseId: s.metadata.leaseId
                        }
                     })
                  }
                  if(lease){
                     await prisma.lease.update({
                        where: {
                           leaseId: lease.leaseId
                        },
                        data: {
                           subscriptionId: s.id
                        }
                     })
                  }
               }
               handleSubscription(subscription);
               return new Response(JSON.stringify('ok'), {status:200});
            }
            case 'customer.subscription.deleted': {
               const subscription = stripeEvent.data.object;
               console.log(subscription);
               const handleSubscription = async (s: typeof subscription) => {
                  const lease = await prisma.lease.findUnique({
                     where: {
                        leaseId: s.metadata.leaseId
                     }
                  })
               }
               handleSubscription(subscription);
               return new Response(null, { status: 200 });
            }
            // case 'payment_intent.succeeded':{
            //    const paymentIntent = stripeEvent.data.object;
            //    const handlePaymentIntent = async (intent:typeof paymentIntent)=> {
            //       try {     
            //          const invoice = await prisma.invoice.findUnique({
            //             where: {
            //                stripeId: paymentIntent.id
            //             }
            //          })
            //          if(invoice){
            //             await prisma.paymentRecord.create({
            //                data: {
            //                   invoiceNum: invoice?.invoiceNum,
            //                   customerId: invoice?.customerId,
            //                   paymentType: 'STRIPE',
            //                   paymentCompleted: new Date,
            //                   paymentAmount: intent.amount_received / 100,
            //                }
            //             })
            //          }
            //       } catch (error) {
            //          console.error(error)
            //       }
            //    }
            //    handlePaymentIntent(paymentIntent);
            //    return new Response(JSON.stringify('ok'), {status: 200});
            // }
            // case 'charge.succeeded': {
            //    const charge = stripeEvent.data.object;
            //    const handleCharge = async (c: typeof charge) =>{
            //       if(c.payment_intent){
            //          const invoice = await prisma.invoice.findFirst({
            //             where: {
            //                stripeId: c.payment_intent.toString()
            //             }
            //          })
            //          try {    
            //             const customer = await prisma.user.findFirst({
            //                where: {
            //                   stripeId: c.customer?.toString()
            //                }
            //             });
            //             if(!customer){
            //                return;
            //             }
                        
            //             const paymentRecord = await prisma.paymentRecord.create({
            //                data:{
            //                   paymentCompleted: new Date(),
            //                   paymentAmount: c.amount / 100,
            //                   stripeId: c.id,
            //                   invoiceNum: invoice?.invoiceNum,
            //                   customerId: customer.id,
            //                   paymentType: 'STRIPE',
            //                   paymentNotes: `Payment for invoice number ${invoice?.invoiceNum}, ${invoice?.invoiceNotes}`
            //                }
            //             })
            //             console.log(paymentRecord)
            //          } catch (error) {
            //             console.error(error)
            //          }  
            //       }
            //    }
            //    handleCharge(charge);
            //    return new Response(JSON.stringify('ok'), {status: 200})
            // }
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