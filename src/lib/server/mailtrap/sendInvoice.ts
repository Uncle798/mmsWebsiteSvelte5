import { PUBLIC_COMPANY_NAME, PUBLIC_URL } from "$env/static/public";
import dayjs from "dayjs";
import type { Invoice, User, Address } from "../../../generated/prisma/client";
import { mailtrap, sender } from "./mailtrap";

export async function sendInvoice(invoice: Invoice, customer: User) {
   if (!customer.emailVerified) {
      return null;
   }
   try {
      const response = await mailtrap.send({
         from: sender,
         to: [{ email: customer.email! }],
         subject: `${PUBLIC_COMPANY_NAME} invoice number: ${invoice.invoiceNum}`,
         html: `Hello ${customer.givenName} <br/>Please visit <a href="${PUBLIC_URL}/invoices/${invoice.invoiceNum}">Invoice number ${invoice.invoiceNum}</a>\
         to view your invoice from ${PUBLIC_COMPANY_NAME}. This invoice is due ${dayjs(invoice.invoiceCreated).add(1, 'month').format('M/D/YYYY')}`,
      });
      return response;
   } catch (error) {
      console.error(error);
      return error;
   }
}
