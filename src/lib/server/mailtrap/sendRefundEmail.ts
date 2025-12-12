import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import { buffer } from "stream/consumers";
import type { RefundRecord, User, Address } from "../../../generated/prisma/client";
import { makeRefundPdf } from "../pdfMake/makeRefundPdf";
import { mailtrap, sender } from "./mailtrap";

export async function sendRefundEmail(refund: RefundRecord, customer: User, address: Address) {
   if (!customer.emailVerified) {
      return null;
   }
   const pdf = await makeRefundPdf(refund, customer, address) as PDFKit.PDFDocument;
   const buf = await buffer(pdf);
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email: customer.email as string }],
         subject: `${PUBLIC_COMPANY_NAME} refund record ${refund.refundNumber}`,
         html: `Hello ${customer.givenName}<br/>Please visit <a href="${PUBLIC_URL}/refundRecords/${refund.refundNumber}">Refund ${refund.refundNumber}</a> to view your refund record.`,
         attachments: [
            {
               filename: `Refund Record ${refund.refundNumber} ${PUBLIC_COMPANY_NAME}.pdf`,
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
