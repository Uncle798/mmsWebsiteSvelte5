import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Invoice, User } from "../../../generated/prisma/client";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import dayjs from "dayjs";
import { printer, styles } from "./pdfMake";
import BlobStream, { type IBlobStream } from "blob-stream";

export async function makeTodaysInvoicesReport(invoices:Invoice[], customers:User[], download?: boolean): Promise<Blob | PDFKit.PDFDocument> {
   const header: ContentText = {
      text: `${PUBLIC_COMPANY_NAME} invoices created ${dayjs().format('MMMM D YYYY')}`,
      style: 'header',
   };
   const table: ContentTable = {
      table: {
         headerRows: 1,
         body: [
            ['Invoice Num', 'Customer name', 'Amount',]
         ]
      }
   }
   let totalInvoiced = 0
   for(const invoice of invoices){
      totalInvoiced += invoice.invoiceAmount;
      const customer = customers.find((customer) => customer.id === invoice.customerId);
      table.table.body.push(
         [invoice.invoiceNum, `${customer?.organizationName ? customer.organizationName : `${customer?.givenName} ${customer?.familyName}`}`, invoice.invoiceAmount]
      );
   }
   table.table.body.push((
      ['', 'total:', totalInvoiced.toString()]
   ))
   const reportDocDef: TDocumentDefinitions = {
      content: [
         header,
         table,
      ],
      styles: styles,
      defaultStyle: {
         font: 'Helvetica'
      }
   }
   const pdf = printer.createPdfKitDocument(reportDocDef);
   if(download){
      return new Promise((resolve, reject) => {
         pdf.pipe(BlobStream()).on('finish', function(this:IBlobStream){
            resolve(this.toBlob('application/pdf'));
         }).on('error', (err) =>{
            console.error('err', err);
            reject(err);
         })
         pdf.end();
      });
   }
   pdf.end();
   return pdf;
}