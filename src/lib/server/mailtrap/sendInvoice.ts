import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import dayjs from "dayjs";
import { buffer } from "stream/consumers";
import type { Invoice, User, Address } from "../../../generated/prisma/client";
import { makeInvoicePdf } from "../pdfMake/makeInvoicePdf";
import { mailtrap, sender } from "./mailtrap";

export async function sendInvoice(invoice: Invoice, customer: User, address: Address) {
   if (!customer.emailVerified) {
      return null;
   }
   const pdf = await makeInvoicePdf(invoice, customer, address) as PDFKit.PDFDocument;
   const buf = await buffer(pdf);
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email: customer.email! }],
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
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
