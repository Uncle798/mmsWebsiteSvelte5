import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Address, PaymentRecord, User } from "../../../generated/prisma/client";
import dayjs from "dayjs";
import { makeNamePlate } from "./makeNamePlate";
import { makeAddress } from "./makeAddress";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import { fonts, styles } from "./pdfMake";
import * as pdfmake from 'pdfmake';
import { currencyFormatter } from "$lib/utils/currencyFormatter";

export async function makeMultiplePaymentsPDF(payments:PaymentRecord[], customer:User, address:Address, download?:boolean): Promise<Blob | string> {
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
   pdfmake.addFonts(fonts)
   const pdf = pdfmake.createPdf(reportDocDef);
   if(download){
      return pdf.getBlob();
   }
   return pdf.getBase64();
}