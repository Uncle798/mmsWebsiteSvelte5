// import { PUBLIC_COMPANY_NAME } from "$env/static/public";
// import dayjs from "dayjs";
// import type { ContentText, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
// import type { Invoice, User, Address } from "../../../generated/prisma/client";
// import { makeAddress } from "./makeAddress";
// import { makeNamePlate } from "./makeNamePlate";
// import * as pdfmake from 'pdfmake';
// import { styles, fonts } from "./pdfMake";
// import { currencyFormatter } from "$lib/utils/currencyFormatter";

// export async function makeInvoicePdf(invoice: Invoice, customer: User, address: Address, download?: boolean): Promise<Blob | string> {
//    const header: ContentText = {
//       text: `${PUBLIC_COMPANY_NAME} Invoice number ${invoice.invoiceNum}`,
//       style: 'header'
//    };
//    const table: ContentTable = {
//       layout: 'noBorders',
//       table: {
//          headerRows: 0,
//          widths: [100, '*'],
//          body: [
//             ['Amount', currencyFormatter(invoice.invoiceAmount)],
//             ['Date created', dayjs(invoice.invoiceCreated).format('MMMM D YYYY')],
//             ['Date due', dayjs(invoice.invoiceDue).format('MMMM D YYYY')],
//          ]
//       }
//    };
//    if (invoice.invoiceNotes) {
//       table.table.body.push([
//          'Notes', invoice.invoiceNotes
//       ]);
//    }
//    if (invoice.deposit) {
//       table.table.body.push([
//          '', { text: 'Deposit', style: { bold: true } }
//       ]);
//    }
//    const invoiceDocDef: TDocumentDefinitions = {
//       content: [
//          header,
//          '\n',
//          makeNamePlate(customer),
//          makeAddress(address),
//          '\n',
//          table
//       ],
//       styles: styles,
//       defaultStyle: {
//          font: 'Helvetica'
//       }
//    };
//    pdfmake.addFonts(fonts);
//    const pdf = pdfmake.createPdf(invoiceDocDef);
//    if (download) {
//       return pdf.getBlob();
//    }
//    return pdf.getBase64();
// }
