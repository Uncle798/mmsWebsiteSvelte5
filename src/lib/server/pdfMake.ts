import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import type { Address, Invoice, PaymentRecord, RefundRecord, User } from "@prisma/client";
import dayjs from "dayjs";
import PdfPrinter from "pdfmake"
import type { ContentTable, ContentText, StyleDictionary, TDocumentDefinitions } from "pdfmake/interfaces";

const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});

const fonts = {
   Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
   },
}
const printer = new PdfPrinter(fonts);

const styles:StyleDictionary = {
   header: {
      fontSize:18,
      bold: true,
      font: 'Helvetica',
      alignment: 'center'
   },
   basic: {
      font: 'Helvetica'
   }
}
function makeAddress(address:Address){
   let pdfAddress:ContentText = {
      text: [
         address.address1+'\n',
         `${address.city}, ${address.state} ${address.postalCode}\n`
      ],
      style: 'basic'
   }
   if(address.address2){
      pdfAddress = {
         text: [
            address.address1 + '\n',
            address.address2 + '\n',
            `${address.city}, ${address.state} ${address.postalCode}\n`
         ], 
         style: 'basic'
      }
   }
   return pdfAddress
}
function makeNamePlate(user:User){
   let pdfNamePlate:ContentText = {
      text: ''
   };
   if(user.givenName){
      pdfNamePlate = {
         text: [
            user.givenName,
         ],
         style: 'basic'
      }
   }
   if(user.familyName){
      pdfNamePlate = {
         text: [
            user.familyName,
         ],
         style: 'basic'
      }
   }
   if(user.givenName && user.familyName){
      pdfNamePlate = {
         text: `${user.givenName} ${user.familyName}`,
         style: 'basic'
      }
   }
   return pdfNamePlate
}

export async function makeInvoicePdf(invoice:Invoice, customer:User, address:Address) {
   const header:ContentText = {
      text:`${PUBLIC_COMPANY_NAME} Invoice number ${invoice.invoiceNum}`,
      style: 'header'
   }
   const table:ContentTable = {
      layout: 'noBorders',
      table: {
         headerRows: 0,
         widths: [100, '*'],
         body: [
            ['Amount', currencyFormatter.format(invoice.invoiceAmount)],
            ['Date created', dayjs(invoice.invoiceCreated).format('MMMM D YYYY')],
            ['Date due', dayjs(invoice.invoiceDue).format('MMMM D YYYY')],
         ]
      }
   }
   if(invoice.invoiceNotes){
      table.table.body.push([
         'Notes', invoice.invoiceNotes
      ])
   }
   if(invoice.deposit){
      table.table.body.push([
         '',{text:'Deposit', style: {bold:true}}
      ])
   }
   const invoiceDocDef:TDocumentDefinitions = {
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
   }
   const pdf = printer.createPdfKitDocument(invoiceDocDef);
   pdf.end();
   return pdf
}

export async function makeReceiptPdf(paymentRecord:PaymentRecord, customer:User, address:Address){
   const header:ContentText = {
      text: `${PUBLIC_COMPANY_NAME} Payment receipt number ${paymentRecord.paymentNumber}`,
      style: 'header'
   }
   let table:ContentTable = {
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
   } 
   if(paymentRecord.paymentNotes){
      table.table.body.push([
         'Notes', paymentRecord.paymentNotes
      ])
   };
   if(paymentRecord.payee){
      table.table.body.push([
         'Payee', paymentRecord.payee
      ])
   }
   if(paymentRecord.deposit){
      table.table.body.push([
         '', {text:'Deposit', style: {
            bold: true
         }}
      ])
   }
   const receiptDocDef:TDocumentDefinitions = {
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
   }
   const pdf = printer.createPdfKitDocument(receiptDocDef, {});
   pdf.end()
   return pdf
}

export async function makeRefundPdf(refund:RefundRecord, customer:User, address:Address){
   const header:ContentText = { 
      text: `${PUBLIC_COMPANY_NAME} Refund ${refund.refundNumber}`,
      style: 'header'
   };
   const table:ContentTable = {
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
   if(refund.refundNotes){
      table.table.body.push([
         'Notes', refund.refundNotes
      ])
   }
   const refundDocDef:TDocumentDefinitions = {
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
   }
   const pdf = printer.createPdfKitDocument(refundDocDef);
   pdf.end();
   return pdf
}