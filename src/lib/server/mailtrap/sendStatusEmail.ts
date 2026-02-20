import { PUBLIC_COMPANY_NAME } from "$env/static/public";   
import { currencyFormatter } from "$lib/utils/currencyFormatter";
import dayjs from "dayjs";
import { buffer } from "stream/consumers";
import type { User, Lease, PaymentRecord } from "../../../generated/prisma/client";
import { mailtrap, sender } from "./mailtrap";

export async function sendStatusEmail(admin: User, invoiceCount: number, totalInvoice: number, emptyUnits: number, leases:Lease[], payments:PaymentRecord[]) {
   if (admin.email?.includes('veryFakeEmail.com'.toLowerCase()) || admin.email?.includes('yetAnotherFakeEmail.com'.toLowerCase())) {
      return null;
   }
   let totalPaid = 0;
   for(const payment of payments){
      totalPaid += payment.paymentAmount
   }
   let html = `Hello ${admin.givenName}<br/> ${invoiceCount} invoices were created this morning totaling ${currencyFormatter(totalInvoice)}.\
      There are ${emptyUnits} empty units as of this morning. <br/>
      Yesterday ${currencyFormatter(totalPaid)} in payments were recorded from ${payments.length} payments<br/>`;
   for(const lease of leases){
      html += `${lease.unitNum} <br/>`
   }
   if (admin.admin) {
      try {
         const response = await mailtrap.send({
            from: sender,
            to: [{ email: admin.email! }],
            subject: `${PUBLIC_COMPANY_NAME} Daily email`,
            html,
         });
         return response;
      } catch (error) {
         console.error(error);
         return error;
      }
   }
}
