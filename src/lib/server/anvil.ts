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

const fields = [
   {
      "id": "leaseStartDay",
      "name": "Lease Start Day",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 140,
         "y": 152,
         "height": 15,
         "width": 28
      },
      fontWeight: 'bold'
   },
   {
      "id": "leaseStartMonth",
      "name": "Lease Start Month",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 211,
         "y": 152,
         "height": 15,
         "width": 50
      },
      fontWeight: 'bold'
   },
   {
      "id": "leaseStartYear",
      "name": "Lease Start Year",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 271,
         "y": 152,
         "height": 15,
         "width": 18
      },
      fontWeight: 'bold',
      alignment: 'right'
   },
   {
      "id": "tenantName",
      "name": "Tenant Name",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 360,
         "y": 167,
         "height": 15,
         "width": 200
      },
      fontWeight: 'bold',
      alignment: 'right'
   },
   {
      "id": "unitNum",
      "name": "Unit Number",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 264,
         "y": 265,
         "height": 15,
         "width": 44
      },
      fontWeight: 'bold'
   },
   {
      "id": "unitSize",
      "name": "Unit Size",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 385,
         "y": 265,
         "height": 15,
         "width": 52
      },
      fontWeight: 'bold'
   },
   {
      "id": "leaseStartDay",
      "name": "Lease Start Day",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 437,
         "y": 408,
         "height": 15,
         "width": 27
      },
      fontWeight: 'bold'
   },
   {
      "id": "leaseStartMonth",
      "name": "Lease Start Month",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 77,
         "y": 425,
         "height": 15,
         "width": 103
      },
      fontWeight: 'bold'
   },
   {
      "id": "leaseStartYear",
      "name": "Lease Start Year",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 188,
         "y": 425,
         "height": 15,
         "width": 32
      },
      fontWeight: 'bold'
   },
   {
      "id": "unitPrice",
      "name": "Unit Price",
      "type": "shortText",
      "pageNum": 0,
      "rect": {
         "x": 335,
         "y": 522,
         "height": 15,
         "width": 51
      },
      fontWeight: 'bold'
   },
   {
    "id": "leaseStartDay",
    "name": "Lease Start Day",
    "type": "shortText",
    "pageNum": 0,
    "rect": {
      "x": 164,
      "y": 538,
      "height": 15,
      "width": 38
      },
      fontWeight: 'bold'
   },
   {
    "id": "tenantName",
    "name": "Tenant Name",
    "type": "shortText",
    "pageNum": 4,
    "rect": {
      "x": 340,
      "y": 138,
      "height": 15,
      "width": 200
      },
      fontWeight: 'bold',
      alignment: 'right'
   },
   {
   "name": "Street 1 - Tenant Address",
   "id": 'tenantAddress1',
   "type": 'shortText',
   "pageNum": 4,
   "rect": {
      "x": 340,
      "y": 158,
      "height": 15,
      "width": 200
      },
      fontWeight: 'bold',
      alignment: 'right',
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
         "width": 100
      },
      fontWeight: 'bold'
   },
   {
      "name": "State - Tenant Address",
      "id": 'tenantAddressState',
      "type": 'shortText',
      "pageNum": 4,
      "rect": {
         "x": 440,
         "y": 200,
         "height": 15,
         "width": 30
      },
      fontWeight: 'bold'
   },
   {
      "name": "Postal Code - Tenant Address",
      "id": 'tenantAddressPostalCode',
      "type": 'shortText',
      "pageNum": 4,
      "rect": {
         "x": 465,
         "y": 200,
         "height": 15,
         "width": 73
      },
      fontWeight: 'bold',
      alignment: 'right'
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
      },
      fontWeight: 'bold',
      alignment: 'right'
  },
  {
    "id": "tenantEmail",
    "name": "tenantEmail",
    "type": "email",
    "pageNum": 4,
    "rect": {
      "x": 280,
      "y": 236,
      "height": 15,
      "width": 250
      },
   fontWeight: 'bold',
   alignment: 'right'
  },
  {
    "id": "numKeysProvided",
    "name": "Number of Keys",
    "type": "shortText",
    "pageNum": 4,
    "rect": {
      "x": 207,
      "y": 274,
      "height": 15,
      "width": 64
    },
    fontWeight: 'bold'
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
      "x": 320,
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

function arrayBufferToBase64(buffer:ArrayBuffer){
   let binary = '';
   const bytes = new Uint8Array(buffer);
   let length = bytes.byteLength;
   for(let i =0; i < length; i++){
      binary += String.fromCharCode(bytes[i]);
   }
   return btoa(binary);
}

export async function createLease(customer:User, lease:Lease, unit:Unit, employee:User, address:Address, alternateContact?:User, alternateAddress?:Address, testing?:boolean){
   const templateFiles = await list({
      token: BLOB_READ_WRITE_TOKEN,
      prefix: 'MMS Lease'
   });
   
   const file = await fetch(templateFiles.blobs[0].url);
   const arrayBuffer = await file.arrayBuffer();
   let base64 = '';
   if(file){
      base64 = arrayBufferToBase64(arrayBuffer);
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
   const tenantName = customer.organizationName ? customer.organizationName : `${customer.givenName} ${customer.familyName}`;
   const signerType = testing ? 'embedded' : 'email';
   const pr = new Intl.PluralRules('en-US', { type: 'ordinal'});
   const suffixes = new Map([
      ["one", "st"],
      ["two", "nd"],
      ["few", "rd"],
      ["other", "th"],
   ]);
   const formatOrdinals = (n:number) => {
      const rule = pr.select(n);
      const suffix = suffixes.get(rule);
      return `${n}${suffix}`;
   }
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
               leaseStartDay: formatOrdinals(lease.leaseCreatedAt.getDate()),
               leaseStartMonth: dayjs(lease.leaseCreatedAt).format('MMMM'),
               leaseStartYear: dayjs(lease.leaseCreatedAt).format('YYYY'),
               tenantName,
               unitNum: humanUnitNum(unit.num),
               unitSize: humanUnitSize(unit.size),
               unitPrice: lease.price,
               tenantAddress1: address.address1,
               tenantAddress2: address.address2,
               tenantAddressCity: address.city,
               tenantAddressState: address.state?.substring(0, 3).toUpperCase(),
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
         }[],
      signerType: string | undefined;
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
         ],
         signerType,
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
               ],
               signerType,
            });
         }
         index ++;
      }
   } else {
      signers.push({
         id: 'tenantSigner',
         routingOrder: 1, 
         name: tenantName,
         email: customer.email!,
         fields: [
            {
               fileId: 'leaseTemplate', 
               fieldId: 'tenantSignature'
            },
         ],
         signerType,
      })
   }
   const contract = await anvilClient.createEtchPacket({
      variables: {
         isDraft: false,
         isTest: true, 
         files: {
            id: 'leaseTemplate',
            file: {
               data: base64,
               filename: `${PUBLIC_COMPANY_NAME} lease unit ${humanUnitNum(unit.num)} - ${tenantName}.pdf`,
               mimetype: 'application/pdf',
            },
            fields,
            fontSize: 12,
            textColor: '#000000',
         },
         data,
         signers,
         signatureEmailSubject: `Lease for unit ${humanUnitNum(unit.num)} at ${PUBLIC_COMPANY_NAME}`,
         signatureEmailBody: `Please sign the lease for unit number ${humanUnitNum(unit.num)} at ${PUBLIC_COMPANY_NAME}.`,
         replyToName: PUBLIC_COMPANY_NAME,
         replyToEmail: PUBLIC_COMPANY_EMAIL,
      }
   });
   if(testing){
      const { url, errors, } = await anvilClient.generateEtchSignUrl({
         variables: {
            clientUserId: customer.id,
            signerEid: contract.data?.data.createEtchPacket.documentGroup.signers[0].eid
         }
      });
      return { url, errors }
   } 
   return contract 

}