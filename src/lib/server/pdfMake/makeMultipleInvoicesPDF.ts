import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import { currencyFormatter } from "$lib/utils/currencyFormatter";
import type { Address, Invoice, User } from "../../../generated/prisma/client";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import * as pdfmake from 'pdfmake'
import { fonts, styles } from "./pdfMake";
import BlobStream, { type IBlobStream } from "blob-stream";
import { makeNamePlate } from "./makeNamePlate";
import { makeAddress } from "./makeAddress";
import dayjs from "dayjs";
import  utc  from "dayjs";
dayjs.extend(utc);
export async function makeMultipleInvoicesPDF(invoices:Invoice[], customer:User, address:Address, download?:boolean): Promise<Blob | string> {

   const table:ContentTable = {
      table: {
         widths: [ 50, '*', 50, 100, 50],
         headerRows: 1,
         body: [
            ['Number', 'Notes', 'Amount', 'Due date', 'Amount paid']
         ],
      },
      layout: 'lightHorizontalLines',
   }
   let totalInvoiced = 0;
   let totalPaid = 0;
   let index = 1;
   let title = `${PUBLIC_COMPANY_NAME}`
   if(invoices.length === 1){
      title += ` invoice`
   } else {
      title += ' invoices'
   }
   for(const invoice of invoices){
      totalInvoiced += invoice.invoiceAmount;
      totalPaid += invoice.amountPaid;
      table.table.body.push(
         [
            invoice.invoiceNum, 
            invoice.invoiceNotes ? invoice.invoiceNotes : '', 
            currencyFormatter(invoice.invoiceAmount),
            dayjs(invoice.invoiceDue).format('MMMM D YYYY'),
            currencyFormatter(invoice.amountPaid),
         ]
      );
      console.log(invoices.length)
      console.log(index)
      if(index === invoices.length){
         title += ` ${invoice.invoiceNum}.`
      } else {
         title += ` ${invoice.invoiceNum},`
      }
      index += 1;
   }
   const header:ContentText = {
      text: title,
      style: 'header'
   }
   const sumTable: ContentTable = {
      table: {
         widths: [ 50, '*', 50, 100, 50],
         body: [
            ['', '', '', 'Total invoiced', currencyFormatter(totalInvoiced)],
            ['', '', '', 'Total paid', currencyFormatter(totalPaid)]
         ]
      },
      layout: 'noBorders'
   }
   const reportDocDef: TDocumentDefinitions = {
      content: [
         header,
         '\n',
         makeNamePlate(customer),
         makeAddress(address),
         '\n',
         table,
         sumTable,
      ],
      styles: styles,
      defaultStyle: {
         font: 'Helvetica'
      },
      info: {
         title,
      }
   }
   pdfmake.addFonts(fonts);
   const pdf = pdfmake.createPdf(reportDocDef);
   if(download){
      return pdf.getBlob();
   }
   return pdf.getBase64()
}