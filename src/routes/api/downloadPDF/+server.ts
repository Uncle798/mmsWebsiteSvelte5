
// import { prisma } from "$lib/server/prisma";
// import { error, type RequestHandler } from "@sveltejs/kit";
// import { PUBLIC_COMPANY_NAME } from "$env/static/public";
// import type { Invoice, PaymentRecord } from "../../../generated/prisma/client";
// import type { RefundRecord} from "../../../generated/prisma/client";

// export const GET:RequestHandler = async (event) => {
//    const refundNumbers = event.url.searchParams.getAll('refundNum');
//    const paymentNumbers = event.url.searchParams.getAll('paymentNum');
//    const invoiceNumbers = event.url.searchParams.getAll('invoiceNum');
//    if(refundNumbers.length > 0){
//       const refunds:RefundRecord[] = [];
//       let filename = `${PUBLIC_COMPANY_NAME} `
//       if(refundNumbers.length === 1){
//          filename += 'refund'
//       } else {
//          filename += 'refunds'
//       }
//       for(const refundNum of refundNumbers){
//          const refund = await prisma.refundRecord.findUnique({
//             where: {
//                refundNumber: parseInt(refundNum, 10),
//             }
//          });
//          if(refund){
//             refunds.push(refund);
//             filename += ` ${refund.refundNumber} `
//          }
//       }
//       if(refunds.length === 0){
//          throw error(404, {message: 'Refunds not found'});
//       } else {
//          filename += '.pdf'
//          const customer = await prisma.user.findUnique({
//             where: {
//                id: refunds[0].customerId
//             }
//          })
//          if(!customer){
//             throw error(500, {
//                message: 'Customer not found'
//             })
//          }
//          const address = await prisma.address.findFirst({
//             where: {
//                userId: customer?.id
//             }
//          })
//          if(!address){
//             throw error(500, {
//                message: 'Address not found'
//             })
//          }
//          event.setHeaders({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': 'inline',
//             'filename': filename
//          })
//          return new Response(pdf,{
//             status: 200
//          })
//       }
//    }
//    if(paymentNumbers.length > 0){
//       const payments:PaymentRecord[] = [];
//       let filename = `${PUBLIC_COMPANY_NAME} `;
//       if(paymentNumbers.length === 1){
//          filename += 'payment'
//       } else {
//          filename += 'payments'
//       }
//       for(const paymentNum of paymentNumbers){
//          const payment = await prisma.paymentRecord.findUnique({
//             where: {
//                paymentNumber: parseInt(paymentNum, 10)
//             }
//          });
//          if(payment){
//             payments.push(payment);
//             filename += ` ${payment.paymentNumber},`
//          }
//       }
//       if(payments.length === 0){
//          throw error(404, {message: 'Payments not found'});
//       } else {
//          filename += '.pdf'
//          const customer = await prisma.user.findUnique({
//             where: {
//                id: payments[0].customerId,
//             }
//          });
//          if(!customer){
//             throw error(500, { message: 'Customer not found'});
//          }
//          const address = await prisma.address.findFirst({
//             where: {
//                AND: [
//                   {
//                      userId: customer.id
//                   },
//                   {
//                      softDelete: false
//                   }
//                ]
//             }
//          });
//          if(!address){
//             throw error(500, { message: 'Address not found'});
//          }
//          const pdf = await makeMultiplePaymentsPDF(payments, customer, address, true) as Blob;
//          event.setHeaders({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': 'inline',
//             'filename': filename
//          })
//          return new Response(pdf,{
//             status: 200
//          })
//       }
//    }
//    if(invoiceNumbers.length > 0){
//       let invoices:Invoice[] = [];
//       let filename = `${PUBLIC_COMPANY_NAME} `;
//       if(invoiceNumbers.length === 1){
//          filename += 'payment';
//       } else {
//          filename += 'payments'
//       }
//       for(const invoiceNum of invoiceNumbers){
//          const invoice = await prisma.invoice.findUnique({
//             where: {
//                invoiceNum: parseInt(invoiceNum, 10),
//             },
//          });
//          if(invoice){
//             invoices.push(invoice);
//             filename += ` ${invoice.invoiceNum},`
//          }
//       }
//       if(invoices.length === 0){
//          throw error(404, {
//             message: 'No invoices found'
//          });
//       }
//       invoices = invoices.sort((a, b) => {
//          if(a.invoiceNum > b.invoiceNum){
//             return 1;
//          }else if(a.invoiceNum < b.invoiceNum){
//             return -1;
//          } else {
//             return 0;
//          }
//       })
//       const customer = await prisma.user.findUnique({
//          where: {
//             id: invoices[0].customerId
//          }
//       });
//       if(!customer){
//          throw error(500, {message: 'Customer not found'});
//       }
//       const address = await prisma.address.findFirst({
//          where: {
//             AND: [
//                {
//                   userId: customer.id,
//                },
//                {
//                   softDelete: false,
//                }
//             ]
//          }
//       });
//       if(!address){
//          throw error(500, 'Address not found');
//       }
//       const pdf = await makeMultipleInvoicesPDF(invoices, customer, address, true) as Blob;
//       filename += '.pdf'
//       const res = new Response(pdf, {
//          status: 200,
//       });
//       event.setHeaders({
//          'Content-Type': 'application/pdf',
//          'Content-Disposition': 'inline',
//          'filename': filename
//       })
//       return new Response(pdf,{
//          status: 200
//       })
//       return res;
//    }
//    throw error(400, {
//       message: 'Record Number not provided'
//    })
// }