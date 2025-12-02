import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import BlobStream, { type IBlobStream } from "blob-stream";
import dayjs from "dayjs";
import type { ContentText, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
import type { RefundRecord, User, Address } from "../../../generated/prisma/client";
import { makeAddress } from "./makeAddress";
import { makeNamePlate } from "./makeNamePlate";
import { currencyFormatter, styles, printer } from "./pdfMake";


export async function makeRefundPdf(refund: RefundRecord, customer: User, address: Address, download?: boolean): Promise<Blob | PDFKit.PDFDocument> {
   const header: ContentText = {
      text: `${PUBLIC_COMPANY_NAME} Refund ${refund.refundNumber}`,
      style: 'header'
   };
   const table: ContentTable = {
      layout: 'noBorders',
      table: {
         headerRows: 0,
         widths: [150, '*'],
         body: [
            ['Amount', currencyFormatter.format(refund.refundAmount),],
            ['Date Created', dayjs(refund.refundCompleted).format('MMMM D YYYY')],
            ['Type', refund.refundType]
         ]
      }
   };
   if (refund.refundNotes) {
      table.table.body.push([
         'Notes', refund.refundNotes
      ]);
   }
   const refundDocDef: TDocumentDefinitions = {
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
   const pdf = printer.createPdfKitDocument(refundDocDef);
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
