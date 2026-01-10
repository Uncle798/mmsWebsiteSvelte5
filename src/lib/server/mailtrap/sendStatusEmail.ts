import { PUBLIC_COMPANY_NAME } from "$env/static/public";   
import { currencyFormatter } from "$lib/utils/currencyFormatter";
import dayjs from "dayjs";
import { buffer } from "stream/consumers";
import type { User, Lease, PaymentRecord } from "../../../generated/prisma/client";
import { mailtrap, sender } from "./mailtrap";

export async function sendStatusEmail(admin: User, invoiceCount: number, totalInvoice: number, emptyUnits: number, leases:Lease[], pdf: PDFKit.PDFDocument, payments:PaymentRecord[], paymentsPdf: PDFKit.PDFDocument) {
   if (admin.email?.includes('veryFakeEmail.com'.toLowerCase()) || admin.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())) {
      return null;
   }
   let totalPaid = 0;
   for(const payment of payments){
      totalPaid += payment.paymentAmount
   }
   let html = `Hello ${admin.givenName}<br/> ${invoiceCount} invoices were created this morning totaling ${currencyFormatter(totalInvoice)}.\
      There are ${emptyUnits} empty units as of this morning. <br/>
      Yesterday ${currencyFormatter(totalPaid)} in payments were recorded from ${payments.length} payments`;
   for(const lease of leases){
      html += `${lease.unitNum} <br/>`
   }
   const buf = await buffer(pdf);
   const buf2 = await buffer(paymentsPdf);
   if (admin.admin) {
      try {
         const response = await mailtrap.send({
            from: sender,
            to: [{ email: admin.email! }],
            subject: `${PUBLIC_COMPANY_NAME} Daily email`,
            html,
            attachments: [
               {
                  filename: `${PUBLIC_COMPANY_NAME} Invoices ${dayjs().format('MMMM D YYYY')}`,
                  content: buf.toString('base64'),
                  type: 'application/pdf'
               },
               {
                  filename: `${PUBLIC_COMPANY_NAME} payments ${dayjs().subtract(1, 'day').format('MMMM D YYYY')}.pdf`,
                  content: buf2.toString('base64'),
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
}
