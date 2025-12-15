import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Invoice, User } from '../../../generated/prisma/client';
import dayjs from 'dayjs';
import { stringify } from 'csv';
import { sortUsers } from '$lib/userSort';

export const GET: RequestHandler = async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized');
   }
   const allUnits = event.url.searchParams.get('allUnits');
   if(allUnits === 'true'){
      const units = await prisma.unit.findMany({
         orderBy: {
            num: 'asc'
         }
      });
      const leases = await prisma.lease.findMany({
         where: {
            leaseEnded: null
         }
      });
      const customers = await prisma.user.findMany({
         where: {
            customerLeases: {
               some: {
                  leaseEnded: null,
               }
            }
         }
      });
      const invoices = await prisma.invoice.findMany({
         where: {
            amountPaid: {
               lt: prisma.invoice.fields.invoiceAmount
            }
         },
         orderBy: {
            invoiceDue: 'asc'
         }
      })
      const data:string[] = [];
      const csv = stringify({
         header: true,
         columns: [{key: 'unitNum'}, {key: 'size'}, {key: 'familyName'}, {key: 'givenName'}, {key: 'invoiceDue'}, {key: 'leasedPrice'}, {key: 'advertisedPrice'}]
      });
      csv.on('readable', () => {
         let row;
         while((row = csv.read()) !== null){
            data.push(row)
         }
      });
      csv.on('error', (err) => {
         console.error(err.message)
      });
      for(const unit of units){
         const lease = leases.find((lease) => lease.unitNum === unit.num);
         let customer: User | undefined = undefined;
         let customerInvoices:Invoice[] = [];
         if(lease){
            customer = customers.find((customer) => customer.id === lease.customerId);
         }
         if(customer){
            customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
         }
         let sortingName = customer?.organizationName ? customer.organizationName : customer?.familyName;
         if(sortingName === null || sortingName === undefined){
            sortingName = ''
         }
         if(sortingName === '' && unit.unavailable){
            sortingName = 'unavailable';
         }
         const json = {
            unitNum: unit.num.replace(/^0+/gm, ''),
            size: unit.size.replace(/0/gm,'').replace(/x0/gm, 'x'),
            familyName: sortingName,
            givenName: customer?.givenName ? customer.givenName : '',
            invoiceDue: customerInvoices[0]?.invoiceDue ? dayjs(customerInvoices[0].invoiceDue).format('MM/DD/YYYY') : '',
            leasedPrice: unit.leasedPrice ? unit.leasedPrice : 0,
            advertisedPrice: unit.advertisedPrice,
         }
         csv.write(json);
      }
      csv.end();
      return new Response(data.join(''), {status: 200});
   }
   const currentCustomers = event.url.searchParams.get('currentCustomers');
   if(currentCustomers === 'true'){
      let customers = await prisma.user.findMany({
         where: {
            customerLeases: {
               some: {
                  leaseEnded: null
               }
            }
         },
      });
      customers = sortUsers(customers);
      const invoices = await prisma.invoice.findMany({
         where: {
            AND: [
               { 
                  customer: {
                     customerLeases: {
                        some: {
                           leaseEnded: null
                        }
                     }
                  }
               },
               {
                  invoiceAmount: {
                     gt: prisma.invoice.fields.amountPaid
                  }
               }
            ]
         },
         orderBy: {
            invoiceDue: 'asc'
         }
      });
      const leases = await prisma.lease.findMany({
         where: {
            leaseEnded: null
         } 
      })
      const csv = stringify({
         header: true,
         columns: [{key:'Name'}, {key: 'Units'}, {key:'Phone number'}, {key: 'Earliest due date'}, {key: 'Amount due'}]
      });
      const data:string[] = [];
      csv.on('readable', () => {
         let row;
         while((row = csv.read()) !== null){
            data.push(row)
         }
      });
      csv.on('error', (err) => {
         console.error(err.message)
      });
      for(const customer of customers){
         const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
         let totalDue = 0;
         let earliestDue = new Date();
         for(const invoice of customerInvoices){
            if(invoice.invoiceDue < earliestDue){
               earliestDue = invoice.invoiceDue
            }
            if(invoice.invoiceDue < new Date()){
               totalDue += invoice.invoiceAmount - invoice.amountPaid;
            }
         };
         let unitNumbers:string[] = [];
         const customerLeases = leases.filter((lease) => lease.customerId === customer.id);
         for(const lease of customerLeases){
            unitNumbers.push(lease.unitNum.replace(/^0+/gm, ''));
         }
         const address = await prisma.address.findFirst({
            where: {
               AND: [
                  {
                     softDelete: false
                  },
                  {
                     userId: customer.id
                  }
               ]
            }
         })
         const json = {
            "Name": customer.organizationName ? customer.organizationName : `${customer.givenName} ${customer.familyName}`,
            'Units': unitNumbers.join(' '),
            'Phone number': address?.phoneNum1?.substring(0,3) + '.' + address?.phoneNum1?.substring(3,6) + '.' + address?.phoneNum1?.substring(6),
            'Earliest due date': customerInvoices[0] ? dayjs(earliestDue).format('MM/DD/YYYY') : '',
            'Amount due': totalDue,
         }
         csv.write(json);
      }
      csv.end();
      return new Response(data.join(''), { status: 200 })
   }
   const phoneBook = event.url.searchParams.get('phoneBook');
   if(phoneBook === 'true'){
      const users = await prisma.user.findMany({
         where: {
            alternative: false
         },
      });
      const addresses = await prisma.address.findMany({
         where: {
            user: {
               alternative: false,
            }
         }
      })
      const csv = stringify({
         header: true,
         columns: [{key:'name'}, {key:'phoneNumber'}, ]
      });
      const data:string[] = [];
      csv.on('readable', () => {
         let row;
         while((row = csv.read()) !== null){
            data.push(row)
         }
      });
      csv.on('error', (err) => {
         console.error(err.message)
      });
      for(const user of users){
         const address = addresses.find((address) => address.userId === user.id)
         let name = user.organizationName;
         if(!name){
            name = `"${user.givenName} ${user.givenName}"`
         }
         const json = {
            name,
            phoneNumber: address?.phoneNum1
         }
         csv.write(json)
      }
      csv.end();
      return new Response(data.join(''),{status: 200})
   }
   return new Response();
};