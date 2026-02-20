// import type { ContentText, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
// import type { Address, RefundRecord, User } from "../../../generated/prisma/client";
// import { PUBLIC_COMPANY_NAME } from "$env/static/public";
// import * as pdfmake from 'pdfmake';
// import { styles, fonts } from "./pdfMake";
// import dayjs from "dayjs";
// import { makeNamePlate } from "./makeNamePlate";
// import { makeAddress } from "./makeAddress";
// import { currencyFormatter } from "$lib/utils/currencyFormatter";

// export async function makeMultipleRefundsPDF(refunds:RefundRecord[], customer:User, address:Address, download?:boolean): Promise<Blob | string>{
//    const header:ContentText = {
//       text: `${PUBLIC_COMPANY_NAME} refunds`,
//       style: 'header',
//    }
//    const table:ContentTable = {
//       table: {
//          widths: [ 50, '*', 50, 100 ],
//          headerRows: 1,
//          body: [
//             ['Number', 'Notes', 'Amount', 'Date refunded']
//          ],
//       },
//       layout: 'lightHorizontalLines',
//    }
//    let totalRefunded = 0;
//    let title = `${PUBLIC_COMPANY_NAME}`
//    if(refunds.length === 1){
//       title += ' refund'
//    } else {
//       title += ' refunds'
//    }
//    for(const refund of refunds){
//       title += ` ${refund.refundNumber},`
//       totalRefunded += refund.refundAmount;
//       table.table.body.push(
//          [
//             refund.refundNumber,
//             refund.refundNotes ? refund.refundNotes : '',
//             currencyFormatter(refund.refundAmount),
//             dayjs(refund.refundCompleted).format('MMMM D YYYY')
//          ]
//       )
//    }
//    const sumTable:ContentTable = {
//       table: {
//          widths: [ 50, '*', 50, 100 ],
//          body: [
//             [ '', '', 'Total refunded', totalRefunded]
//          ]
//       },
//       layout: 'noBorders'
//    }
//    const reportDocDef:TDocumentDefinitions = {
//       content: [
//          header,
//          '\n',
//          makeNamePlate(customer),
//          makeAddress(address),
//          '\n',
//          table,
//          sumTable,
//       ],
//       styles: styles,
//       defaultStyle: {
//          font: 'Helvetica'
//       },
//       info: {
//          title,
//       }
//    }
//    pdfmake.addFonts(fonts);
//    const pdf = pdfmake.createPdf(reportDocDef);
//    if(download){
//       return pdf.getBlob();
//    }
//    return pdf.getBase64();
// }