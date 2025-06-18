import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import type { Address, PaymentRecord, User } from "@prisma/client";
import dayjs from "dayjs";
import PdfPrinter from "pdfmake"
import type { ContentText, ContentUnorderedList,  StyleDictionary, TDocumentDefinitions } from "pdfmake/interfaces";

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
      font: 'Helvetica'
   },
   basic: {
      font: 'Helvetica'
   }
}
function makeAddress(address:Address){
   let pdfAddress:ContentUnorderedList = {
      ul: [
         address.address1,
         `${address.city}, ${address.state} ${address.postalCode}`
      ],
      style: 'basic'
   }
   if(address.address2){
      pdfAddress = {
         ul: [
            address.address1,
            address.address2,
            `${address.city}, ${address.state} ${address.postalCode}`
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

export function makeReceiptPdf(paymentRecord:PaymentRecord, customer:User, address:Address){
   const receiptDocDef:TDocumentDefinitions = {
      content: [
         {
            text: `${PUBLIC_COMPANY_NAME} Payment receipt number ${paymentRecord.paymentNumber}`,
            style: 'header'
         },
         makeNamePlate(customer),
         makeAddress(address), 
         {
            columns: [
               {text:[
                  'Amount',
                  'Payment type',
                  'Payment Completed',
               ],
               style: 'basic'
               },
               {text: [
                  currencyFormatter.format(paymentRecord.paymentAmount),
                  paymentRecord.paymentType.toString(),
                  dayjs(paymentRecord.paymentCompleted).format('MMMM YYYY'),
               ],
                  style: 'basic'
               }
            ]
         }
      ],
      styles: styles,
   }
   console.log(receiptDocDef)
   const pdf = printer.createPdfKitDocument(receiptDocDef, {});
   return pdf
}