import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import type { Invoice, PaymentRecord, User } from "@prisma/client";
import { MailtrapClient } from "mailtrap";
import type { PartialUser } from "./partialTypes";

const token = process.env.MAILTRAP_TOKEN!;
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

export async function sendInvoiceEmail(invoice:Invoice, customer:PartialUser) {
   const response = await mailtrap.send({
      from: sender,
      to: [{email: customer.email!}],
      subject: `Invoice ${invoice.invoiceNum} from ${PUBLIC_COMPANY_NAME}`,
      html: `Hello ${customer.givenName} <br/>Please pay $${invoice.invoiceAmount} for ${invoice.invoiceNotes} to pay please visit \
      <a href="${PUBLIC_URL}/invoices/pay?invoiceNum=${invoice.invoiceNum}>Pay invoice </a>`
   })
   return response
}

export async function sendPaymentReceipt(customer:User, paymentRecord:PaymentRecord) {
   const response = await mailtrap.send({
      from: sender,
      to: [{email: customer.email!}],
      subject: `${PUBLIC_COMPANY_NAME} receipt number ${paymentRecord.paymentNumber}`,
      html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/paymentRecords/${paymentRecord.paymentNumber}>Record number ${paymentRecord.paymentNumber}</a> to view your receipt.`,
   })
   return response
}