import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import BlobStream, { type IBlobStream } from "blob-stream";
import dayjs from "dayjs";
import type { ContentText, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
import type { PaymentRecord, User, Address } from "../../../generated/prisma/client";
import { makeAddress } from "./makeAddress";
import { makeNamePlate } from "./makeNamePlate";
import { currencyFormatter, styles, printer } from "./pdfMake";

export async function makeReceiptPdf(paymentRecord: PaymentRecord, customer: User, address: Address, download?: boolean): Promise<Blob | PDFKit.PDFDocument> {
   const header: ContentText = {
      text: `${PUBLIC_COMPANY_NAME} Payment receipt number ${paymentRecord.paymentNumber}`,
      style: 'header'
   };
   let table: ContentTable = {
      layout: 'noBorders',
      table: {
         headerRows: 0,
         widths: [150, '*'],
         body: [
            ['Amount', currencyFormatter.format(paymentRecord.paymentAmount)],
            ['Date', dayjs(paymentRecord.paymentCompleted).format('MMMM D YYYY')],
            ['Type', paymentRecord.paymentType],
         ]
      },
      style: {
         alignment: 'justify'
      }
   };
   if (paymentRecord.paymentNotes) {
      table.table.body.push([
         'Notes', paymentRecord.paymentNotes
      ]);
   };
   if (paymentRecord.payee) {
      table.table.body.push([
         'Payee', paymentRecord.payee
      ]);
   }
   if (paymentRecord.deposit) {
      table.table.body.push([
         '', {
            text: 'Deposit', style: {
               bold: true
            }
         }
      ]);
   }
   const receiptDocDef: TDocumentDefinitions = {
      content: [
         header,
         '\n',
         makeNamePlate(customer),
         makeAddress(address),
         '\n',
         table,
      ],
      defaultStyle: {
         font: 'Helvetica'
      },
      styles: styles,
   };
   const pdf = printer.createPdfKitDocument(receiptDocDef, {});
   if (download) {
      return new Promise((resolve, reject) => {
         pdf.pipe(BlobStream()).on('finish', function (this: IBlobStream) {
            resolve(this.toBlob('application/pdf'));
         }).on('error', (err) => {
            console.error(err);
            reject(err);
         });
         pdf.end();
      });
   }
   pdf.end();
   return pdf;
}
