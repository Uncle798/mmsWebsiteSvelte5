import Anvil from "@anvilco/anvil";
import { PUBLIC_COMPANY_NAME } from '$env/static/public';
import { ANVIL_API_KEY } from "$env/static/private";
import type { Address, Lease, Unit, User } from "../../generated/prisma/client";
import { humanUnitNum } from "$lib/utils/humanUnitNum";
import { humanUnitSize } from "$lib/utils/humanUnitSize";

export const anvilClient = new Anvil({apiKey:ANVIL_API_KEY});

export const leaseTemplateId = 'xpTVlW1pfNrWdfdsBV2a'

export function getPacketVariables(customer:User, lease:Lease, unit:Unit, employee:User, address:Address){
   let customerName = customer.organizationName;
   if(!customerName){
      customerName = `${customer.givenName} ${customer.familyName}`
   }
   const unitNum = humanUnitNum(unit.num)
   return {
      isDraft: false,
      isTest: true,
      name: `${PUBLIC_COMPANY_NAME} Lease unit ${unitNum} ${customerName}`,
      signatureEmailSubject: `Lease for Unit ${unitNum} at ${PUBLIC_COMPANY_NAME}`,
      signatureEmailBody: `Please sign the attached lease for unit ${unitNum} from ${PUBLIC_COMPANY_NAME}`,
      files:[
         {
            castEid: leaseTemplateId,
         }
      ],
      data: {
         payloads: {
            leaseTemplate:{
               data: {
                  'customerName':customerName,
                  'companyName': PUBLIC_COMPANY_NAME,
                  'leaseEffectiveDate': lease.leaseEffectiveDate,
                  'unitNum': unitNum,
                  'size': humanUnitSize(unit.size),
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