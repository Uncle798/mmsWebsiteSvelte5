import { redirect } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Invoice, User } from '../../../generated/prisma/client';
import dayjs from 'dayjs';
import { stringify } from 'csv';
import { sortUsers } from '$lib/userSort';

export const POST: RequestHandler = async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized');
   }
   return produce(async function start({emit}){
      emit('message', 'Gathering info');
      const allUnits = event.url.searchParams.get('allUnits');
      if(allUnits === 'true'){
         const units = await prisma.unit.findMany({
            orderBy: {
               num: 'asc'
            }
         });
         emit('message', 'Units gathered');
         const leases = await prisma.lease.findMany({
            where: {
               leaseEnded: null
            }
         });
         emit('message', 'Leases gathered');
         const customers = await prisma.user.findMany({
            where: {
               customerLeases: {
                  some: {
                     leaseEnded: null,
                  }
               }
            }
         });
         emit('message', 'Customers gathered');
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
         emit('message', 'Invoices gathered');
         const data:string[] = [];
         const csv = stringify({
            header: true,
            columns: [{key: 'Unit number'}, {key: 'Size'}, {key: 'Family name'}, {key: 'Given name'}, {key: 'Invoice due'}, {key: 'Leased price'}, {key: 'Advertised price'}]
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
         emit('message', 'CSV being generated')
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
               'Unit number': unit.num.toString().replace(/^0+/gm, ''),
               'Size': unit.size.replace(/0/gm,'').replace(/x0/gm, 'x'),
               'Family name': sortingName,
               'Given name': customer?.givenName ? customer.givenName : '',
               'Invoice due': customerInvoices[0]?.invoiceDue ? dayjs(customerInvoices[0].invoiceDue).format('MM/DD/YYYY') : '',
               'Leased price': unit.leasedPrice ? unit.leasedPrice : 0,
               'Advertised price': unit.advertisedPrice,
            }
            csv.write(json);
         }
         csv.end();
         emit('csv', data.join(''));
         emit('message', 'CSV ready');
         return function cancel(){};
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
         emit('message', 'Customers gathered')
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
         emit('message', 'Invoices gathered');
         const leases = await prisma.lease.findMany({
            where: {
               leaseEnded: null
            } 
         });
         emit('message', 'Leases gathered');
         const data:string[] = [];
         const csv = stringify({
            header: true,
            columns: [{key:'Name'}, {key: 'Units'}, {key:'Phone number'}, {key: 'Earliest due date'}, {key: 'Amount due'}]
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
         emit('message', 'CSV being generated');
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
            const customerLeases = leases.filter((lease) => lease.customerId === customer.id)
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
               'Name': customer.organizationName ? customer.organizationName : `${customer.givenName} ${customer.familyName}`,
               'Units': unitNumbers.join(' '),
               'Phone number': address?.phoneNum1?.substring(0,3) + '.' + address?.phoneNum1?.substring(3,6) + '.' + address?.phoneNum1?.substring(6),
               'Earliest due date': customerInvoices[0] ? dayjs(earliestDue).format('MM/DD/YYYY') : '',
               'Amount due': totalDue,
            }
            csv.write(json);
         }
         csv.end();
         emit('csv', data.join(''));
         emit('message', 'CSV ready');
         return function cancel(){};
      }
      const phoneBook = event.url.searchParams.get('phoneBook');
      if(phoneBook === 'true'){
         const users = await prisma.user.findMany({
            where: {
               alternative: false
            },
         });
         emit('message', 'Users gathered');
         const addresses = await prisma.address.findMany({
            where: {
               user: {
                  alternative: false,
               }
            }
         });
         emit('message', 'Addresses gathered')
         const data: any[] = [];
         const csv = stringify(
            {
               header: true,
               columns: [{key: 'name'}, {key: 'phoneNumber'}]
            },
         );
         csv.on('readable', () => {
            let row;
            while((row = csv.read()) !== null){
               data.push(row);
            }
         });
         csv.on('error', (err) => {
            console.error(err.message)
         });
         for(const user of users){
            const address = addresses.find((address) => address.userId === user.id)
            let name = user.organizationName;
            if(!name){
               name = `${user.givenName} ${user.familyName}`
            }
            if(address && address.phoneNum1){
               const json = {
                  'name': name,
                  'phoneNumber': address.phoneNum1
               }
               csv.write(json)
            }
         }
         csv.end();
         emit('csv', data.join(''));
         emit('message', 'CSV ready');
         return function cancel(){};
      }
      return function cancel(){};
   })
};