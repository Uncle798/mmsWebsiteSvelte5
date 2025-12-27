import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Address, PaymentRecord, User } from "../../../generated/prisma/client";
import dayjs from "dayjs";
import BlobStream, { type IBlobStream } from "blob-stream";
import { makeNamePlate } from "./makeNamePlate";
import { makeAddress } from "./makeAddress";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import { printer, styles } from "./pdfMake";
import { currencyFormatter } from "$lib/utils/currencyFormatter";

export async function makeMultiplePaymentsPDF(payments:PaymentRecord[], customer:User, address:Address, download?:boolean): Promise<Blob | PDFKit.PDFDocument> {
   const header:ContentText = {
      text: `${PUBLIC_COMPANY_NAME} payments`,
      style: 'header'
   }
   const table:ContentTable = {
      table: {
         widths: [ 50, '*', 50, 100, 50],
         headerRows: 1,
         body: [
            ['Number', 'Notes', 'Amount', 'Date paid']
         ],
      },
      layout: 'lightHorizontalLines'
   }
   let totalPaid = 0;
   let title = `${PUBLIC_COMPANY_NAME}`
   if(payments.length === 1){
      title += ' payment'
   } else {
      title += ' payments'
   }
   for(const payment of payments){
      title += `${payment.paymentNumber}, `
      totalPaid += payment.paymentAmount;
      table.table.body.push(
         [
            payment.paymentNumber,
            payment.paymentNotes ? payment.paymentNotes : '',
            currencyFormatter(payment.paymentAmount),
            dayjs(payment.paymentCompleted).format('MMMM D YYYY')
         ]
      )
   }
   const sumTable:ContentTable = {
      table: {
         widths: [ 50, '*', 50, 100 ],
         body: [
            [ '', '', 'Total paid', currencyFormatter(totalPaid) ]
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