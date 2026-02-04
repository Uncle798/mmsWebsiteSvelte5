import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Unit } from "../../../generated/prisma/client";
import { PUBLIC_COMPANY_NAME } from "$env/static/public";
import dayjs from "dayjs";
import * as pdfmake from 'pdfmake';
import { fonts, styles } from "./pdfMake";
import { humanUnitNum } from "$lib/utils/humanUnitNum";
import { humanUnitSize } from "$lib/utils/humanUnitSize";

export async function makeAvailableUnitsReport(units:Unit[], download?:boolean): Promise<Blob | string>{
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
            [ humanUnitNum(unit.num), humanUnitSize(unit.size), unit.advertisedPrice ]
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
   pdfmake.addFonts(fonts);
   const pdf = pdfmake.createPdf(reportDocDef);
   if(download){
      return pdf.getBlob();
   }
   return pdf.getBase64();
}