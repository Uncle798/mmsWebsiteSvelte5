import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import type { Address, PaymentRecord, User } from "@prisma/client";
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

export async function makeReceiptPdf(paymentRecord:PaymentRecord, customer:User, address:Address){
   const header = {
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
   return pdf
}