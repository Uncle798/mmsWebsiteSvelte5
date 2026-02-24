// import type { ContentTable, ContentText, TDocumentDefinitions } from "pdfmake/interfaces";
// import type { PaymentRecord, User } from "../../../generated/prisma/client";
// import { PUBLIC_COMPANY_NAME } from "$env/static/public";
// import dayjs from "dayjs";
// import { currencyFormatter } from "$lib/utils/currencyFormatter";
// import { fonts, styles } from "./pdfMake";
// import * as pdfmake from 'pdfmake';

// export async function makeYesterdaysPaymentsReport(payments:PaymentRecord[], customers:User[], download?:boolean):Promise<Blob | Base64URLString> {
//    const header: ContentText ={
//       text: `${PUBLIC_COMPANY_NAME} payments created ${dayjs().format('MMMM D YYYY')}`,
//       style: 'header'
//    };
//    const table:ContentTable = {
//       table: {
//          headerRows: 1,
//          body: [
//             ['Payment Num', 'Customer name', 'Amount', 'Method']
//          ]
//       }
//    };
//    let totalPaid = 0;
//    for(const payment of payments){
//       const customer = customers.find((customer) => customer.id === payment.customerId)
//       totalPaid += payment.paymentAmount;
//       table.table.body.push(
//          [
//             payment.paymentNumber,
//             customer?.organizationName ? customer.organizationName : `${customer?.givenName} ${customer?.familyName}`,
//             currencyFormatter(payment.paymentAmount),
//             (payment.paymentType.substring(0,1)+payment.paymentType.substring(1).toLowerCase()).replaceAll('_', ' '),
//          ]
//       )
//    }
//    table.table.body.push(
//       [
//          '',
//          'total:',
//          currencyFormatter(totalPaid),
//          '' 
//       ]
//    )
//    const reportDocDef: TDocumentDefinitions = {
//          content: [
//             header,
//             table,
//          ],
//          styles: styles,
//          defaultStyle: {
//             font: 'Helvetica'
//          }
//       }
//       pdfmake.addFonts(fonts);
//       const pdf = pdfmake.createPdf(reportDocDef);
//       if(download){
//          return pdf.getBlob();
//       }
//       return pdf.getBase64();
// }