import type { ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { User } from "../../../generated/prisma/client";
import { fonts, styles } from "./pdfMake";
import * as pdfmake from 'pdfmake'
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import dayjs from "dayjs";

export async function makeDailyReport(customers:User[], download?:boolean): Promise<Blob | string>{
   const docTitle = `${PUBLIC_COMPANY_NAME} daily report ${dayjs().format('MMMM D YYYY')}`
   const header:ContentText = {
      text: docTitle,
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
   pdfmake.addFonts(fonts);
   const pdf = pdfmake.createPdf(reportDocDef);
   if(download){
      return pdf.getBlob()
   } else {
      return await pdf.getBase64();
   }
}