// import type { ContentText } from "pdfmake/interfaces";
// import type { User } from "../../../generated/prisma/client";

// export function makeNamePlate(user: User) {
//    let pdfNamePlate: ContentText = {
//       text: ''
//    };
//    if (user.givenName) {
//       pdfNamePlate = {
//          text: user.givenName,
//          style: 'basic'
//       };
//    }
//    if (user.familyName) {
//       pdfNamePlate = {
//          text: user.familyName,
//          style: 'basic'
//       };
//    }
//    if (user.givenName && user.familyName) {
//       pdfNamePlate = {
//          text: `${user.givenName} ${user.familyName}`,
//          style: 'basic'
//       };
//    }
//    if(user.organizationName && user.givenName && user.familyName){
//       pdfNamePlate = {
//          text: [
//             user.organizationName,
//             `${user.givenName} ${user.familyName}`
//          ]
//       }
//    }
//    return pdfNamePlate;
// }
