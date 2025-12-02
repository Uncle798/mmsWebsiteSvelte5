import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Unit } from "../../../generated/prisma/client";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import dayjs from "dayjs";
import { printer, styles } from "./pdfMake";
import BlobStream, { type IBlobStream } from "blob-stream";

export async function makeAvailableUnitsReport(units:Unit[], download?:boolean): Promise<Blob | PDFKit.PDFDocument>{
   const header:ContentText = {
      text: `${PUBLIC_COMPANY_NAME} Open Units for ${dayjs().format('MMMM D YYYY')}`,
      style: 'header'
   };
   const table: ContentTable = {
      layout: 'borders',
      table: {
         headerRows: 1,
         body: [
            ['Unit Num', 'Size', 'Advertised Price']
         ]
      }
   }
   for(const unit of units){
      if(!unit.leasedPrice && !unit.unavailable){
         table.table.body.push(
            [unit.num.toString().replace(/^0+/gm, ''), unit.size, unit.advertisedPrice]
         )
      }
   }
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