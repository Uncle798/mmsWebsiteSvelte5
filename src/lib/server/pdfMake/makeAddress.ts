// import type { ContentText } from "pdfmake/interfaces";
// import type { Address } from "../../../generated/prisma/client";

// export function makeAddress(address: Address) {
//    let pdfAddress: ContentText = {
//       text: [
//          address.address1 + '\n',
//          `${address.city}, ${address.state} ${address.postalCode}\n`
//       ],
//       style: 'basic'
//    };
//    if (address.address2) {
//       pdfAddress = {
//          text: [
//             address.address1 + '\n',
//             address.address2 + '\n',
//             `${address.city}, ${address.state} ${address.postalCode}\n`
//          ],
//          style: 'basic'
//       };
//    }
//    return pdfAddress;
// }
