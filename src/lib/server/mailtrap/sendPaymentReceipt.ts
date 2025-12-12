import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import { buffer } from "stream/consumers";
import type { User, PaymentRecord, Address } from "../../../generated/prisma/client";
import { makeReceiptPdf } from "../pdfMake/makeReceiptPdf";
import { mailtrap, sender } from "./mailtrap";

export async function sendPaymentReceipt(customer: User, paymentRecord: PaymentRecord, address: Address) {
   if (!customer.emailVerified) {
      return null;
   }
   const pdf = await makeReceiptPdf(paymentRecord, customer, address) as PDFKit.PDFDocument;
   const buf = await buffer(pdf);
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email: customer.email! }],
         subject: `${PUBLIC_COMPANY_NAME} receipt number ${paymentRecord.paymentNumber}`,
         html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/paymentRecords/${paymentRecord.paymentNumber}">Record number ${paymentRecord.paymentNumber}</a> to view your receipt.`,
         attachments: [
            {
               filename: `Receipt ${paymentRecord.paymentNumber} ${PUBLIC_COMPANY_NAME}.pdf`,
               content: buf.toString('base64'),
               type: 'application/pdf'
            }
         ]
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
