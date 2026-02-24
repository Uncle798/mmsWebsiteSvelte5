import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import type { User, PaymentRecord, Address } from "../../../generated/prisma/client";
import { mailtrap, sender } from "./mailtrap";

export async function sendPaymentReceipt(customer: User, paymentRecord: PaymentRecord) {
   if (!customer.emailVerified) {
      return null;
   }
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email: customer.email! }],
         subject: `${PUBLIC_COMPANY_NAME} receipt number ${paymentRecord.paymentNumber}`,
         html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/paymentRecords/${paymentRecord.paymentNumber}">Record number ${paymentRecord.paymentNumber}</a> to view your receipt.`,
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
