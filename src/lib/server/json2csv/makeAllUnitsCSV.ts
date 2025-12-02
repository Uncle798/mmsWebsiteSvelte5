import { json2csv } from 'json-2-csv';
import type { Unit, User, Lease, Invoice } from '../../../generated/prisma/client';
import dayjs from 'dayjs';

export async function makeAllUnitsCSV(units:Unit[], leases:Lease[], customers:User[], invoices:Invoice[]) {
   const allJSON:{
      unitNum: string,
      size: string,
      familyName:string,
      givenName: string,
      nextDueDate: string,
      leasedPrice: number,
      advertisedPrice: number
   }[] = [];
   for(const unit of units){
      const lease = leases.find((lease) => lease.unitNum === unit.num);
      let customer:User | undefined = undefined;
      let customerInvoices:Invoice[] = [];
      if(lease){
         customer = customers.find((customer) => customer.id === lease.customerId);
         customerInvoices = invoices.filter((invoice) => invoice.customerId === customer?.id);
         if(customerInvoices.length > 1){
            customerInvoices = customerInvoices.sort((a, b) => {
               if(a.invoiceDue > b.invoiceDue){
                  return 1;
               } else if(a.invoiceDue < b.invoiceDue){
                  return -1;
               } else {
                  return 0;
               }
            })
         }
      }
      let sortingName = customer?.organizationName ? customer.organizationName : customer?.familyName;
      if(sortingName === null || sortingName === undefined){
         sortingName = ''
      }
      const json = {
         unitNum: unit.num.replace(/^0+/gm, ''),
         size: unit.size.replace(/0/gm,'').replace(/x0/gm, 'x'),
         familyName: sortingName,
         givenName: customer?.givenName ? customer.givenName : '',
         nextDueDate: customerInvoices[0]?.invoiceDue ? dayjs(customerInvoices[0].invoiceDue).format('MM/DD/YYYY') : '',
         leasedPrice: unit.leasedPrice ? unit.leasedPrice : 0,
         advertisedPrice: unit.advertisedPrice,
      }
      allJSON.push(json)
   }
   return json2csv(allJSON, {
      checkSchemaDifferences: true,
      delimiter: {
         wrap: ''
      }
   });
}