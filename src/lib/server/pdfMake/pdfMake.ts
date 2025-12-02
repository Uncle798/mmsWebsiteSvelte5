import PdfPrinter from "pdfmake"
import type { StyleDictionary } from "pdfmake/interfaces";

export const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});

const fonts = {
   Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
   },
}
export const printer = new PdfPrinter(fonts);

export const styles:StyleDictionary = {
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

