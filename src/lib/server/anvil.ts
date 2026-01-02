import Anvil from "@anvilco/anvil";
import { PUBLIC_COMPANY_EMAIL, PUBLIC_COMPANY_NAME } from '$env/static/public';
import { ANVIL_API_KEY, BLOB_READ_WRITE_TOKEN } from "$env/static/private";
import type { Address, Lease, Unit, User } from "../../generated/prisma/client";
import { humanUnitNum } from "$lib/utils/humanUnitNum";
import { humanUnitSize } from "$lib/utils/humanUnitSize";
import dayjs from "dayjs";
import { prisma } from "./prisma";
import { list } from "@vercel/blob";

export const anvilClient = new Anvil({apiKey:ANVIL_API_KEY});

export const leaseTemplateId = 'xpTVlW1pfNrWdfdsBV2a'

const fields = [
   {
      "id": "leaseStartDay",
      "name": "Lease Start Day",
      "type": "date",
      "pageNum": 0,
      "rect": {
         "x": 144,
         "y": 150,
         "height": 15,
         "width": 28
      }
   },
   {
      "id": "leaseStartMonth",
      "name": "Lease Start Month",
      "type": "date",
      "pageNum": 0,
      "rect": {
         "x": 212,
         "y": 150,
         "height": 15,
         "width": 34
      }
   },
   {
      "id": "leaseStartYear",
      "name": "Lease Start Year",
      "type": "date",
      "pageNum": 0,
      "rect": {
         "x": 250,
         "y": 150,
         "height": 15,
         "width": 19
      }
   },
   {
      "id": "tenantName",
      "name": "Tenant Name",
      "type": "fullName",
      "pageNum": 0,
      "rect": {
         "x": 332,
         "y": 165,
         "height": 15,
         "width": 160
      }
   },
   {
      "id": "unitNum",
      "name": "Unit Number",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 264,
         "y": 263,
         "height": 15,
         "width": 44
      }
   },
   {
      "id": "unitSize",
      "name": "Unit Size",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 381,
         "y": 263,
         "height": 15,
         "width": 52
      }
   },
   {
      "id": "leaseStartDay",
      "name": "Lease Start Day",
      "type": "date",
      "pageNum": 0,
      "rect": {
         "x": 436,
         "y": 407,
         "height": 15,
         "width": 27
      }
   },
   {
      "id": "leaseStartMonth",
      "name": "Lease Start Month",
      "type": "date",
      "pageNum": 0,
      "rect": {
         "x": 77,
         "y": 423,
         "height": 15,
         "width": 103
      }
   },
   {
      "id": "leaseStartYear",
      "name": "Lease Start Year",
      "type": "date",
      "pageNum": 0,
      "rect": {
         "x": 185,
         "y": 423,
         "height": 15,
         "width": 32
      }
   },
   {
      "id": "unitPrice",
      "name": "Unit Price",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 335,
         "y": 521,
         "height": 15,
         "width": 51
      }
   },
   {
    "id": "leaseStartDay",
    "name": "Lease Start Day",
    "type": "date",
    "pageNum": 0,
    "rect": {
      "x": 164,
      "y": 537,
      "height": 15,
      "width": 38
    }
   },
   {
    "id": "tenantsName",
    "name": "Tenants Name",
    "type": "fullName",
    "pageNum": 4,
    "rect": {
      "x": 340,
      "y": 135,
      "height": 15,
      "width": 200
    }
   },
   {
   "name": "Street 1 - Tenant Address",
   "id": 'tenantAddress1',
   "type": 'shortText',
   "pageNum": 4,
   "rect": {
      "x": 340,
      "y": 160,
      "height": 15,
      "width": 198
   }
   },
   {
      "name": "City - Tenant Address",
      "id": 'tenantAddressCity',
      "type": 'shortText',
      "pageNum": 4,
      "rect": {
         "x": 340,
         "y": 200,
         "height": 15,
         "width": 93
      }
   },
   {
      "name": "State - Tenant Address",
      "id": 'tenantAddressState',
      "type": 'shortText',
      "pageNum": 4,
      "rect": {
         "x": 424,
         "y": 200,
         "height": 15,
         "width": 26
      }
   },
   {
      "name": "Postal Code - Tenant Address",
      "id": 'tenantAddressPostalCode',
      "type": 'shortText',
      "pageNum": 4,
      "rect": {
         "x": 455,
         "y": 200,
         "height": 15,
         "width": 73
      }
   },
  {
    "id": "tenantPhone",
    "name": "Tenant Phone",
    "type": "phone",
    "pageNum": 4,
    "rect": {
      "x": 340,
      "y": 220,
      "height": 15,
      "width": 200
    }
  },
  {
    "id": "tenantEmail",
    "name": "tenantEmail",
    "type": "email",
    "pageNum": 4,
    "rect": {
      "x": 340,
      "y": 236,
      "height": 15,
      "width": 200
    }
  },
  {
    "id": "numKeysProvided",
    "name": "Number of Keys",
    "type": "shortText",
    "pageNum": 4,
    "rect": {
      "x": 207,
      "y": 275,
      "height": 15,
      "width": 64
    }
  },
   {
      "id": "managerSignature",
      "name": "Manager Signature",
      "type": "signature",
      "pageNum": 4,
      "rect": {
      "x": 60,
      "y": 300,
      "height": 40,
      "width": 200
      }
   },
   {
      "id": "tenantSignature",
      "name": " Tenant Signature",
      "type": "signature",
      "pageNum": 4,
      "rect": {
      "x": (60 + 200 + 20),
      "y": 300,
      "height": 40,
      "width": 200
      }
   },
  {
    "id": "altName",
    "name": "alt name",
    "type": "shortText",
    "pageNum": 5,
    "rect": {
      "x": 200,
      "y": 140,
      "height": 15,
      "width": 260
    }
  },
  {
    "id": "altAddress",
    "name": "altAddress",
    "type": "shortText",
    "pageNum": 5,
    "rect": {
      "x": 200,
      "y": 158,
      "height": 15,
      "width": 260
    }
  },
  {
    "id": "altCity",
    "name": "altCity",
    "type": "shortText",
    "pageNum": 5,
    "rect": {
      "x": 200,
      "y": 177,
      "height": 15,
      "width": 260
    }
  },
    {
    "id": "altPhone",
    "name": "altPhone",
    "type": "shortText",
    "pageNum": 5,
    "rect": {
      "x": 200,
      "y": 191,
      "height": 15,
      "width": 260
    }
  },
]

export function getPacketVariables(customer:User, lease:Lease, unit:Unit, employee:User, address:Address){
   let customerName = customer.organizationName;
   if(!customerName){
      customerName = `${customer.givenName} ${customer.familyName}`
   }
   const unitNum = humanUnitNum(unit.num);
   const filename = `${PUBLIC_COMPANY_NAME} Lease unit ${unitNum} ${customerName}.pdf`
   return {
      isDraft: false,
      isTest: true,
      name: `${PUBLIC_COMPANY_NAME} Lease unit ${unitNum} ${customerName}`,
      signatureEmailSubject: `Lease for Unit ${unitNum} at ${PUBLIC_COMPANY_NAME}`,
      signatureEmailBody: `Please sign the attached lease for unit ${unitNum} from ${PUBLIC_COMPANY_NAME}`,
      files:[
         {
            id: 'leaseTemplate',
            castEid: leaseTemplateId,
            filename,
         }
      ],
      data: {
         payloads: {
            leaseTemplate:{
               data: {
                  customerName,
                  companyName: PUBLIC_COMPANY_NAME,
                  leaseStartDay: lease.leaseCreatedAt.getDate(),
                  leaseStartMonth: dayjs(lease.leaseCreatedAt).format('MMMM'),
                  leaseStartYear: dayjs(lease.leaseCreatedAt).format('YYYY'),
                  unitNum,
                  unitSize: humanUnitSize(unit.size),
                  rentDueDate: lease.leaseCreatedAt.getDate(),
                  unitPrice: lease.price,
                  address1: address.address1,
                  address2: address.address2,
                  city: address.city,
                  state: address.state,
                  postalCode: address.postalCode,
                  country: address.country,
                  phoneNum: address.phoneNum1,
                  numberOfKeys: lease.keysProvided,
               }
            }
         }
      },
      signers: [
         {
            id: 'customer', 
            name: customerName,
            email: customer.email,
            signerType: 'email',
            fields: [
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'customerSignDate'
               },
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'customerSign', 
               }

            ]
         },
         {
            id: 'manager',
            name: `${employee.givenName}, ${employee.familyName}`,
            email: employee.email,
            signerType: 'email',
            fields: [
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'managerSignature',
               },
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'managerSignatureDate'
               }
            ]
         }
      ]
   }
}
export function getOrganizationalPacketVariables(customer:User, lease:Lease, unit:Unit, employee:User, address:Address){
   return {
      isDraft: false,
      isTest: true,
      name: `Fake Lease ${customer.organizationName} unit ${unit.num.replace(/^0+/gm,'')} at ${PUBLIC_COMPANY_NAME}`,
      signatureEmailSubject: `Lease for Unit ${unit.num.replace(/^0+/gm,'')} at ${PUBLIC_COMPANY_NAME}`,
      signatureEmailBody: `Please sign the attached lease for unit ${unit.num.replace(/^0+/gm,'')} from ${PUBLIC_COMPANY_NAME}`,
      files:[
         {
            id:'leaseTemplate',
            castEid: leaseTemplateId,
         }
      ],
      data: {
         payloads: {
            leaseTemplate:{
               data: {
                  'customerName':customer.organizationName,
                  'representativeName':customer.givenName + ' ' + customer.familyName,
                  'companyName': PUBLIC_COMPANY_NAME,
                  'leaseEffectiveDate': lease.leaseEffectiveDate,
                  'unitNum': unit.num.replace(/^0+/gm,''),
                  'size': unit.size,
                  'price': lease.price,
                  'address':{
                     "street1": address.address1,
                     "street2": address.address2,
                     "city": address.city,
                     'state': address.state,
                     'zip': address.postalCode,
                     'country': address.country
                  }
               }
            }
         }
      },
      signers: [
         {
            id: 'customer', 
            name: `${customer.givenName}, ${customer.familyName}`,
            email: customer.email,
            signerType: 'email',
            fields: [
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'customerSignDate'
               },
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'customerSign', 
               }

            ]
         },
         {
            id: 'manager',
            name: `${employee.givenName}, ${employee.familyName}`,
            email: employee.email,
            signerType: 'email',
            fields: [
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'companySignDate',
               },
               {
                  fileId: 'leaseTemplate',
                  fieldId: 'companySign'
               }
            ]
         }
      ]
   }
}
// from https://gist.github.com/jonleighton/958841
function base64ArrayBuffer(arrayBuffer:ArrayBuffer){
   let base64 = '';
   var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
   const bytes = new Uint8Array(arrayBuffer);
   let byteRemainder = bytes.byteLength % 3;
   const mainLength = bytes.byteLength - byteRemainder;

   for(let i = 0; i < mainLength; i += 3){
      const chunk = (bytes[i] << 16) | (bytes[i+1] << 8) | bytes[i + 2];
      const a = (chunk & 1615072) >> 18;
      const b = (chunk & 258048) >> 12;
      const c = (chunk & 4032) >> 6;
      const d = (chunk & 63);
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
   }
   if(byteRemainder === 1){
      const chunk = bytes[mainLength];
      const a = (chunk & 252) >> 2;
      const b = (chunk & 3) << 4;
      base64 += encodings[a] + encodings[b] + '=='
   } else if(byteRemainder === 2){
      const chunk = (bytes[mainLength] <<8) | bytes[mainLength + 1];
      const a = (chunk & 64512) >> 10;
      const b = (chunk & 1008) >> 4;
      const c = (chunk & 15) << 2;
      base64 += encodings[a] + encodings[b] + encodings[c] + '=';
   }
   return base64;
}

export async function createLease(customer:User, lease:Lease, unit:Unit, employee:User, address:Address, alternateContact?:User, alternateAddress?:Address){
   const templateFiles = await list({
      token: BLOB_READ_WRITE_TOKEN,
      prefix: 'MMS Lease'
   });
   
   const file = await (await fetch(templateFiles.blobs[0].url)).arrayBuffer();
   let base64 = '';
   if(file){
      base64 = base64ArrayBuffer(file);
   }
   const properties = await prisma.propertyWithLien.findMany({
      where: {
         leaseId: lease.leaseId
      },
      include: {
         lienHolder: true,
         lienHolderAddress: true,
      }
   });
   const tenantName = customer.organizationName ? customer.organizationName : `${customer.givenName} ${customer.familyName}`
   let data: {
      payloads: {
         leaseTemplate: {
            data: {
               [key: string] : any
            }
         }
      }
   } = {
      payloads: {
         leaseTemplate: {
            data: {
               leaseStartDay: lease.leaseCreatedAt.getDate(),
               leaseStartMonth: dayjs(lease.leaseCreatedAt).format('MMMM'),
               leaseStartYear: dayjs(lease.leaseCreatedAt).format('YYYY'),
               tenantName,
               unitNum: humanUnitNum(unit.num),
               unitSize: humanUnitSize(unit.size),
               unitPrice: lease.price,
               tenantAddress1: address.address1,
               tenantAddress2: address.address2,
               tenantAddressCity: address.city,
               tenantAddressState: address.state,
               tenantAddressPostalCode: address.postalCode,
               tenantPhone: address.phoneNum1,
               tenantEmail: customer.email,
               numKeysProvided: lease.keysProvided,
               altName: `${alternateContact?.givenName} ${alternateContact?.familyName}`,
               altAddress: `${alternateAddress?.address1} ${alternateAddress?.address2}`,
               altCity: `${alternateAddress?.city, alternateAddress?.state, alternateAddress?.postalCode}`,
               altPhone: alternateAddress?.phoneNum1,
            }
         }
      }, 
   }
   let signers: {
      id: string,
      routingOrder: number,
      name: string,
      email: string,
      fields:
         {
            fileId: string,
            fieldId: string
         }[]
   }[] = [
      {
         id: 'managerSigner',
         routingOrder: 2,
         name: `${employee.givenName} ${employee.familyName}`,
         email: employee.email!,
         fields: [
            {
               fileId: 'leaseTemplate', 
               fieldId: 'managerSignature',
            }
         ]
      }
   ]
   if(address.address2){
      fields.push(
         {
            "name": "Street 2 - Tenant Address",
            "id": 'tenantAddress2',
            "type": 'shortText',
            "pageNum": 4,
            "rect": {
               "x": 340,
               "y": 178,
               "height": 15,
               "width": 196
            }
         }
      );
   }
   if(properties.length > 0){
      let index = 0;
      let pageNum = 5;
      for(const property of properties){
         let y = 240 + (index * 20);
         if(y >= 3300-60){
            y = 60 + (index*20)
            pageNum ++;
         }
         fields.push({
            id: `${property.id}-description`,
            name: 'Property Description',
            type: 'shortText',
            pageNum,
            rect: {
               x: 65,
               y,
               height: 15,
               width: 250
            }
         });
         fields.push({
            id: `${property.id}-lienHolder`,
            name: 'Property Lien Holder',
            type: 'shortText',
            pageNum,
            rect: {
               x: (65 + 250 + 20),
               y,
               height: 15,
               width: 250
            }
         });
         data.payloads.leaseTemplate.data[`${property.id}-description`] = property.descriptionOfProperty;
         data.payloads.leaseTemplate.data[`${property.id}-lienHolder`] = `${property.lienHolder.organizationName ? property.lienHolder.organizationName : `${property.lienHolder.givenName} ${property.lienHolder.familyName}`} ${property.lienHolderAddress.address1}`;
         if(index === properties.length - 1){
            fields.push({
               id: 'lienSignature',
               name: 'Lien signature', 
               type: 'signature',
               pageNum,
               rect: {
                  x: (2550/2 - 250/2),
                  y, 
                  height: 15,
                  width: 250
               }
            });
            signers.push({
               id: 'tenantSigner',
               routingOrder: 1, 
               name: customer.organizationName ? customer.organizationName : `${customer.givenName, customer.familyName}`,
               email: customer.email!,
               fields: [
                  {
                     fileId: 'leaseTemplate', 
                     fieldId: 'tenantSignature'
                  },
                  {
                     fileId: 'leaseTemplate',
                     fieldId: 'lienSignature'
                  }
               ]
            });
         }
         index ++;
      }
   } else {
      signers.push({
         id: 'tenantSigner',
         routingOrder: 1, 
         name: customer.organizationName ? customer.organizationName : `${customer.givenName, customer.familyName}`,
         email: customer.email!,
         fields: [
            {
               fileId: 'leaseTemplate', 
               fieldId: 'tenantSignature'
            },
         ]
      })
   }
   console.log(base64.length)
   return anvilClient.createEtchPacket({
      variables: {
         isDraft: false,
         isTest: true, 
         files: {
            id: 'leaseTemplate',
            file: {
               data: base64,
               filename: `${PUBLIC_COMPANY_NAME} lease unit ${humanUnitNum(unit.num)} - ${tenantName}.pdf`,
               mimetype: 'application/pdf'
            },
            fields,
         },
         data,
         signers,
         signatureEmailSubject: `Lease for unit ${humanUnitNum(unit.num)} at ${PUBLIC_COMPANY_NAME}`,
         signatureEmailBody: `Please sign the lease for unit number ${humanUnitNum(unit.num)} at ${PUBLIC_COMPANY_NAME}.`,
         replyToName: PUBLIC_COMPANY_NAME,
         replyToEmail: PUBLIC_COMPANY_EMAIL,
      }
   })
}
