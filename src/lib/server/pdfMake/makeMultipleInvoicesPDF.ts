import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Address, Invoice, User } from "../../../generated/prisma/client";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import { printer, styles } from "./pdfMake";
import BlobStream, { type IBlobStream } from "blob-stream";
import { makeNamePlate } from "./makeNamePlate";
import { makeAddress } from "./makeAddress";
import dayjs from "dayjs";
import  utc  from "dayjs";
dayjs.extend(utc);
export async function makeMultipleInvoicesPDF(invoices:Invoice[], customer:User, address:Address, download?:boolean): Promise<Blob | PDFKit.PDFDocument> {
   const header:ContentText = {
      text: `${PUBLIC_COMPANY_NAME} invoices`,
      style: 'header'
   }
   const table:ContentTable = {
      table: {
         headerRows: 1,
         body: [
            ['Invoice number', 'Invoice notes', 'Invoice amount', 'Invoice due', 'Amount paid']
         ],
      },
      layout: 'lightHorizontalLines'
   }
   let totalInvoiced = 0;
   let totalPaid = 0;
   for(const invoice of invoices){
      totalInvoiced += invoice.invoiceAmount;
      totalPaid += invoice.amountPaid;
      table.table.body.push(
         [
            invoice.invoiceNum, 
            invoice.invoiceNotes ? invoice.invoiceNotes : '', invoice.invoiceAmount, 
            invoice.invoiceAmount,
            dayjs(invoice.invoiceDue).format('MMMM D YYYY'),
            invoice.amountPaid,
         ]
      )
   }
   table.table.body.push(['', '', '', '', '']);
   table.table.body.push(['', '', '', 'total invoiced', totalInvoiced]);
   table.table.body.push(['', '', '', 'total paid', totalPaid]);
   const reportDocDef: TDocumentDefinitions = {
      content: [
         header,
         makeNamePlate(customer),
         makeAddress(address),
         table,
      ],
      styles: styles,
      defaultStyle: {
         font: 'Helvetica'
      },
      info: {
         title: `${PUBLIC_COMPANY_NAME} Invoices`
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