import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import dayjs from "dayjs";
import { buffer } from "stream/consumers";
import type { User } from "../../../generated/prisma/client";
import { mailtrap, sender, currencyFormatter } from "./mailtrap";

export async function sendStatusEmail(admin: User, invoiceCount: number, totalInvoice: number, emptyUnits: number, pdf: PDFKit.PDFDocument) {
   if (admin.email?.includes('veryFakeEmail.com'.toLowerCase()) || admin.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())) {
      return null;
   }
   const buf = await buffer(pdf);
   if (admin.admin) {
      try {
         const response = await mailtrap.send({
            from: sender,
            to: [{ email: admin.email! }],
            subject: `${PUBLIC_COMPANY_NAME} Daily email`,
            html: `Hello ${admin.givenName}<br/> ${invoiceCount} invoices were created this morning totaling ${currencyFormatter.format(totalInvoice)}.\
            There are ${emptyUnits} empty units as of this morning. <br/>`,
            attachments: [
               {
                  filename: `${PUBLIC_COMPANY_NAME} Invoices ${dayjs().format('MMMM D YYYY')}`,
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
}
