import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import { buffer } from "stream/consumers";
import type { RefundRecord, User, Address } from "../../../generated/prisma/client";
import { mailtrap, sender } from "./mailtrap";

export async function sendRefundEmail(refund: RefundRecord, customer: User) {
   if (!customer.emailVerified) {
      return null;
   }
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email: customer.email as string }],
         subject: `${PUBLIC_COMPANY_NAME} refund record ${refund.refundNumber}`,
         html: `Hello ${customer.givenName}<br/>Please visit <a href="${PUBLIC_URL}/refundRecords/${refund.refundNumber}">Refund ${refund.refundNumber}</a> to view your refund record.`,
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
