import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import type { Invoice, PaymentRecord, User } from "@prisma/client";
import { MailtrapClient } from "mailtrap";
import dayjs from "dayjs";

const token = process.env.MAILTRAP_TOKEN!;
const currencyFormatter = new Intl.NumberFormat('en-us', {style: 'currency', currency:'USD'})
export const mailtrap = new MailtrapClient({token})

const sender = {
   name: 'computer@bransonschlegel.com',
   email: 'computer@bransonschlegel.com',
}
export async function sendVerificationEmail(verificationCode:string, email:string) {
   const response = await mailtrap.send({
      from:sender,
      to: [{email}],
      subject: "Please verify your email",
      html: `Verification code: ${verificationCode}`
   }).catch((err) =>{
      console.error(err);
   })
   return response;
}

export async function sendMagicLinkEmail(magicLink:string, email:string) {

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
}

export async function sendPaymentReceipt(customer:User, paymentRecord:PaymentRecord) {
   const response = await mailtrap.send({
      from: sender,
      to: [{email: customer.email!}],
      subject: `${PUBLIC_COMPANY_NAME} receipt number ${paymentRecord.paymentNumber}`,
      html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/paymentRecords/${paymentRecord.paymentNumber}">Record number ${paymentRecord.paymentNumber}</a> to view your receipt.`,
   })
   return response
}

export async function sendInvoice(invoice:Invoice, customer:User) {
   const response = await mailtrap.send({
      from: sender,
      to: [{email: customer.email!}],
      subject: `${PUBLIC_COMPANY_NAME} invoice number: ${invoice.invoiceNum}`,
      html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/invoices/${invoice.invoiceNum}">Invoice number ${invoice.invoiceNum}\
      to view your invoice from ${PUBLIC_COMPANY_NAME}. This invoice is due ${dayjs(invoice.invoiceCreated).add(1, 'month').format('M/D/YYYY')}`
   })
   return response
}

export async function sendStatusEmail(admin:User, invoiceCount:number, totalInvoice:number, emptyUnits:number) {
   const response = await mailtrap.send({
      from: sender,
      to: [{email: admin.email!}],
      subject: `${PUBLIC_COMPANY_NAME} Daily email`,
      html: `Hello ${admin.givenName}<br/> ${invoiceCount} invoices were created this morning totaling ${currencyFormatter.format(totalInvoice)}.\
      There are ${emptyUnits} empty units as of this morning. <br/>`
   })
   return response
}