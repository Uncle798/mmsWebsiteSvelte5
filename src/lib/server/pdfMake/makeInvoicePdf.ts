import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import BlobStream, { type IBlobStream } from "blob-stream";
import dayjs from "dayjs";
import type { ContentText, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Invoice, User, Address } from "../../../generated/prisma/client";
import { makeAddress } from "./makeAddress";
import { makeNamePlate } from "./makeNamePlate";
import { styles, printer } from "./pdfMake";
import { currencyFormatter } from "$lib/utils/currencyFormatter";

export async function makeInvoicePdf(invoice: Invoice, customer: User, address: Address, download?: boolean): Promise<Blob | PDFKit.PDFDocument> {
   const header: ContentText = {
      text: `${PUBLIC_COMPANY_NAME} Invoice number ${invoice.invoiceNum}`,
      style: 'header'
   };
   const table: ContentTable = {
      layout: 'noBorders',
      table: {
         headerRows: 0,
         widths: [100, '*'],
         body: [
            ['Amount', currencyFormatter(invoice.invoiceAmount)],
            ['Date created', dayjs(invoice.invoiceCreated).format('MMMM D YYYY')],
            ['Date due', dayjs(invoice.invoiceDue).format('MMMM D YYYY')],
         ]
      }
   };
   if (invoice.invoiceNotes) {
      table.table.body.push([
         'Notes', invoice.invoiceNotes
      ]);
   }
   if (invoice.deposit) {
      table.table.body.push([
         '', { text: 'Deposit', style: { bold: true } }
      ]);
   }
   const invoiceDocDef: TDocumentDefinitions = {
      content: [
         header,
         '\n',
         makeNamePlate(customer),
         makeAddress(address),
         '\n',
         table
      ],
      styles: styles,
      defaultStyle: {
         font: 'Helvetica'
      }
   };
   const pdf = printer.createPdfKitDocument(invoiceDocDef);
   if (download) {
      return new Promise((resolve, reject) => {
         pdf.pipe(BlobStream()).on('finish', function (this: IBlobStream) {
            resolve(this.toBlob('application/pdf'));
         }).on('error', (err) => {
            console.error('err', err);
            reject(err);
         });
         pdf.end();
      });
   }
   pdf.end();
   return pdf;
}
