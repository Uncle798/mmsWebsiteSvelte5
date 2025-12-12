import type { ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { User } from "../../../generated/prisma/client";
import { printer, styles } from "./pdfMake";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";

import BlobStream, { type IBlobStream } from "blob-stream";
import dayjs from "dayjs";

export async function makeDailyReport(customers:User[], download?:boolean): Promise<Blob | PDFKit.PDFDocument>{
   const header:ContentText = {
      text: `${PUBLIC_COMPANY_NAME} daily report ${dayjs().format('MMMM D YYYY')}`,
      style: 'header'
   }
   const reportDocDef: TDocumentDefinitions = {
      content: [
         header
      ],
      styles,
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