import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import dayjs from "dayjs";
import type { ContentText, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
import type { RefundRecord, User, Address } from "../../../generated/prisma/client";
import { makeAddress } from "./makeAddress";
import { makeNamePlate } from "./makeNamePlate";
import * as pdfmake from 'pdfmake';
import { styles, fonts } from "./pdfMake";
import { currencyFormatter } from "$lib/utils/currencyFormatter";


export async function makeRefundPdf(refund: RefundRecord, customer: User, address: Address, download?: boolean): Promise<Blob | string> {
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
            ['Amount', currencyFormatter(refund.refundAmount),],
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
   pdfmake.addFonts(fonts);
   const pdf = pdfmake.createPdf(refundDocDef);
   if (download) {
      return pdf.getBlob();
   }
   return pdf.getBase64();;
}
