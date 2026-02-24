// import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
// import type { Invoice, User } from "../../../generated/prisma/client";
// import { PUBLIC_COMPANY_NAME } from "$env/static/public";
// import dayjs from "dayjs";
// import * as pdfmake from 'pdfmake';
// import { fonts, styles } from "./pdfMake";

// export async function makeTodaysInvoicesReport(invoices:Invoice[], customers:User[], download?: boolean): Promise<Blob | string> {
//    const header: ContentText = {
//       text: `${PUBLIC_COMPANY_NAME} invoices created ${dayjs().format('MMMM D YYYY')}`,
//       style: 'header',
//    };
//    const table: ContentTable = {
//       table: {
//          headerRows: 1,
//          body: [
//             ['Invoice Num', 'Customer name', 'Amount',]
//          ]
//       }
//    }
//    let totalInvoiced = 0
//    for(const invoice of invoices){
//       totalInvoiced += invoice.invoiceAmount;
//       const customer = customers.find((customer) => customer.id === invoice.customerId);
//       table.table.body.push(
//          [invoice.invoiceNum, `${customer?.organizationName ? customer.organizationName : `${customer?.givenName} ${customer?.familyName}`}`, invoice.invoiceAmount]
//       );
//    }
//    table.table.body.push((
//       ['', 'total:', totalInvoiced.toString()]
//    ))
//    const reportDocDef: TDocumentDefinitions = {
//       content: [
//          header,
//          table,
//       ],
//       styles: styles,
//       defaultStyle: {
//          font: 'Helvetica'
//       }
//    }
//    pdfmake.addFonts(fonts);
//    const pdf = pdfmake.createPdf(reportDocDef);
//    if(download){
//       return pdf.getBlob()
//    }
//    return pdf.getBase64();
// }