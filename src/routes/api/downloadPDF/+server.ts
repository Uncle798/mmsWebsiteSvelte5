import { makeReceiptPdf } from "$lib/server/pdfMake/makeReceiptPdf";
import { makeRefundPdf } from "$lib/server/pdfMake/makeRefundPdf";
import { makeInvoicePdf } from "$lib/server/pdfMake/makeInvoicePdf";
import { prisma } from "$lib/server/prisma";
import { Prisma } from '@prisma/client'
import { error, type RequestHandler } from "@sveltejs/kit";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import type { Invoice } from "../../../generated/prisma/client";

export const GET:RequestHandler = async (event) => {
   const refundNum = event.url.searchParams.get('refundNum');
   const paymentNum = event.url.searchParams.get('paymentNum');
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   const invoiceNumbers = event.url.searchParams.getAll('invoiceNum');
   if(refundNum){
      const refund = await prisma.refundRecord.findUnique({
         where: {
            refundNumber:parseInt(refundNum, 10)
         }
      })
      if(refund){
         const customer = await prisma.user.findUnique({
            where: {
               id: refund?.customerId
            }
         })
         if(!customer){
            throw error(500, {
               message: 'Customer not found'
            })
         }
         const address = await prisma.address.findFirst({
            where: {
               userId: customer?.id
            }
         })
         if(!address){
            throw error(500, {
               message: 'Address not found'
            })
         }
         const pdf = await makeRefundPdf(refund, customer, address, true) as Blob
         event.setHeaders({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
            'filename': `${PUBLIC_COMPANY_NAME} refund ${refund.refundNumber}`
         })
         return new Response(pdf,{
            status: 200
         })
      }
      throw error(404, {
         message: 'Refund not found'
      })
   }
   if(paymentNum){
      const payment = await prisma.paymentRecord.findUnique({
         where: {
            paymentNumber: parseInt(paymentNum, 10)
         }
      });
      if(payment){
         const customer = await prisma.user.findUnique({
            where: {
               id: payment.customerId
            }
         })
         if(!customer){
            throw error(500, {
               message: 'Customer not found'
            })
         }
         const address = await prisma.address.findFirst({
            where: {
               AND: [
                  {userId: customer.id},
                  {softDelete: false}
               ]
            }
         })
         if(!address){
            throw error(500, {
               message: 'Address not found'
            })
         }
         const pdf = await makeReceiptPdf(payment, customer, address, true) as Blob;
         event.setHeaders({
            'Content-Type': 'application/pdf'
         })
         const res = new Response(pdf, {
            status: 200,
         });
         res.headers.set('Content-Disposition', 'attachment; filename``')
         return res
      }
      throw error(404, {
         message: 'Payment not found'
      })
   }
   if(invoiceNumbers.length > 0){
      const invoices:Invoice[] = [];
      for(const invoiceNum of invoiceNumbers){
         const invoice = await prisma.invoice.findUnique({
            where: {
               invoiceNum: parseInt(invoiceNum, 10),
            },
         });
         if(invoice){
            invoices.push(invoice);
         }
      }
      if(invoices.length === 0){
         throw error(404, {
            message: 'No invoices found'
         });
      }
      if(invoices.length === 1){
         const customer = await prisma.user.findUnique({
            where: {
               id: invoices[0].customerId
            }
         });
         if(!customer){
            throw error(500, {message: 'Customer not found'});
         }
         const address = await prisma.address.findFirst({
            where: {
               AND: [
                  {
                     userId: customer.id,
                  },
                  {
                     softDelete: false,
                  }
               ]
            }
         });
         if(!address){
            throw error(500, 'Address not found');
         }
         const pdf = await makeInvoicePdf(invoices[0], customer, address, true) as Blob;
         return new Response(pdf, {
            status: 200,
         })
      }
   }
   if(invoiceNum){
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: parseInt(invoiceNum, 10)
         }
      })
      if(invoice){
         const customer = await prisma.user.findUnique({
            where: {
               id: invoice.customerId
            }
         })
         if(!customer){
            throw error(500, {
               message: 'Customer not found'
            })
         }
         const address = await prisma.address.findFirst({
            where: {
               AND: [
                  {userId: customer.id},
                  {softDelete: false}
               ]
            }
         })
         if(!address){
            throw error(500, { 
               message: 'Address not found'
            })
         }
         const pdf = await makeInvoicePdf(invoice, customer, address, true) as Blob;
         return new Response(pdf, {
            status: 200
         })
      }
      throw error(404, {
         message: 'Invoice not found'
      });
   }
   throw error(400, {
      message: 'Record Number not provided'
   })
}