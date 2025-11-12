import {  PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import type { Address, Invoice, PaymentRecord, RefundRecord, User } from "@prisma/client";
import { MailtrapClient } from "mailtrap";
import dayjs from "dayjs";
import { makeInvoicePdf, makeReceiptPdf, makeRefundPdf } from "./pdfMake";
import { buffer } from "stream/consumers";

const token = process.env.MAILTRAP_TOKEN!;
const currencyFormatter = new Intl.NumberFormat('en-us', {style: 'currency', currency:'USD'})
export const mailtrap = new MailtrapClient({token})

const sender = {
   name: 'info@moscowministorage.com',
   email: 'info@moscowministorage.com',
}
export async function sendVerificationEmail(verificationCode:string, email:string) {
   if(email.includes('veryFakeEmail.com'.toLowerCase()) || email.includes('yetAnotherFakeEmail.com'.toLowerCase())){
      return null;
   }
   try {
      const response = await mailtrap.send({
         from:sender,
         to: [{email}],
         subject: "Please verify your email",
         html: `Verification code: ${verificationCode}`
      }).catch((err) =>{
         console.error(err);
      })
      return response;
   } catch (error) {
      console.error(error)
      return error
   }
}

export async function sendMagicLinkEmail(magicLink:string, email:string) {
   if(email.includes('veryFakeEmail.com'.toLowerCase()) || email.includes('yetAnotherFakeEmail.com'.toLowerCase())){
      return null;
   }
   try {
      const response = await mailtrap.send({
         from:sender,
         to: [{email}],
         subject: `Login link from ${PUBLIC_COMPANY_NAME} `,
         html: `Please click this link or paste it into your browser \
         to log in: <a href="${PUBLIC_URL}/login/magicLink/${magicLink}">${PUBLIC_URL}/login/magicLink/${magicLink}</a>`
      }).catch((err) =>{
         console.error(err);
      })
      return response;
   } catch (error) {
      console.error(error)
      return error
   }
}

export async function  sendPaymentReceipt(customer:User, paymentRecord:PaymentRecord, address:Address){
   if(customer.email?.includes('veryFakeEmail.com'.toLowerCase()) || customer.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())){
      return null;
   }
   const pdf = await makeReceiptPdf(paymentRecord, customer, address) as PDFKit.PDFDocument;
   const buf = await buffer(pdf);
   try {      
      const response = await mailtrap.send({
         from: sender,
         to: [{email: customer.email!}],
         subject: `${PUBLIC_COMPANY_NAME} receipt number ${paymentRecord.paymentNumber}`,
         html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/paymentRecords/${paymentRecord.paymentNumber}">Record number ${paymentRecord.paymentNumber}</a> to view your receipt.`,
         attachments: [
            {
               filename: `Receipt ${paymentRecord.paymentNumber} ${PUBLIC_COMPANY_NAME}.pdf`,
               content: buf.toString('base64'),
               type: 'application/pdf'
            }
         ]
      })
      return response
   } catch (error) {
      console.error(error) 
      return error
   }
}

export async function sendInvoice(invoice:Invoice, customer:User, address:Address) {
   if(customer.email?.includes('veryFakeEmail.com'.toLowerCase()) || customer.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())){
      return null;
   }
   const pdf = await makeInvoicePdf(invoice, customer, address) as PDFKit.PDFDocument;
   const buf = await buffer(pdf);
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{email: customer.email!}],
         subject: `${PUBLIC_COMPANY_NAME} invoice number: ${invoice.invoiceNum}`,
         html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/invoices/${invoice.invoiceNum}">Invoice number ${invoice.invoiceNum}</a>\
         to view your invoice from ${PUBLIC_COMPANY_NAME}. This invoice is due ${dayjs(invoice.invoiceCreated).add(1, 'month').format('M/D/YYYY')}`,
         attachments: [
            {
               filename: `Invoice ${invoice.invoiceNum} ${PUBLIC_COMPANY_NAME}.pdf`,
               content: buf.toString('base64'),
               type: 'application/pdf',
            }
         ]
      })
      return response
   } catch (error) {
      console.error(error)
      return error
   }
}

export async function sendStatusEmail(admin:User, invoiceCount:number, totalInvoice:number, emptyUnits:number) {
   if(admin.email?.includes('veryFakeEmail.com'.toLowerCase()) || admin.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())){
      return null;
   }
   if(admin.admin){
      try {
         const response = await mailtrap.send({
            from: sender,
            to: [{email: admin.email!}],
            subject: `${PUBLIC_COMPANY_NAME} Daily email`,
            html: `Hello ${admin.givenName}<br/> ${invoiceCount} invoices were created this morning totaling ${currencyFormatter.format(totalInvoice)}.\
            There are ${emptyUnits} empty units as of this morning. <br/>`
         })
         return response 
      } catch (error) {
         console.error(error)
         return error
      }
   }
}

export async function sendRefundEmail(refund:RefundRecord, customer:User, address:Address) {
   if(customer.email?.includes('veryFakeEmail.com'.toLowerCase()) || customer.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())){
      return null;
   }
   const pdf = await makeRefundPdf(refund, customer, address) as PDFKit.PDFDocument;
   const buf = await buffer(pdf);
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{email:customer.email as string}],
         subject: `${PUBLIC_COMPANY_NAME} refund record ${refund.refundNumber}`,
         html: `Hello ${customer.givenName}<br/>Please visit <a href="${PUBLIC_URL}/refundRecords/${refund.refundNumber}">Refund ${refund.refundNumber}</a> to view your refund record.`,
         attachments: [
            {
               filename: `Refund Record ${refund.refundNumber} ${PUBLIC_COMPANY_NAME}.pdf`,
               content: buf.toString('base64'),
               type: 'application/pdf'
            }
         ]
      })
      return response;
   } catch (error){
      console.error(error)
      return error
   }
}