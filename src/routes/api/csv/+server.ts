import { redirect } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Invoice, User } from '../../../generated/prisma/client';
import dayjs from 'dayjs';
import { stringify } from 'csv';
import { userSort } from '$lib/utils/userSort';
import { humanUnitNum } from '$lib/utils/humanUnitNum';
import { humanUnitSize } from '$lib/utils/humanUnitSize';

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
         let date = event.url.searchParams.get('date');
         if(!date){
            date = new Date().toDateString();
         }
         let leases;
         if(date){
            leases = await prisma.lease.findMany({
               where: {
                  OR: [
                     { leaseEnded: null},
                     { AND: [
                        { leaseEnded: {
                              gte: new Date(date)
                        }},
                        {
                           leaseEffectiveDate: {
                              lte: new Date(date)
                           }
                        }
                     ]}
                  ]
               },
               include: {
                  customer: {
                     include: {
                        address: true
                     }
                  }
               }
            })
         } else {
            leases = await prisma.lease.findMany({
               where: {
                  leaseEnded: null
               },
               include: {
                  customer: {
                     include: {
                        address: true
                     }
                  }
               }
            });
         }
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
         const data:string[] = [];
         const csv = stringify({
            header: true,
            columns: [{key: 'Unit number'}, {key: 'Size'}, {key: 'Advertised price'}, {key: 'Leased price'}, {key: 'Family name'}, {key: 'Given name'}, {key: 'Invoice due'}, {key: 'Amount Owed'}, {key: 'Lease Start'}, {key: 'Date of Requested Report'}]
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
            let customer: User | undefined = lease?.customer;
            let customerInvoices:Invoice[] = [];
            let amountOwed = 0;
            if(customer){
               const invoices = await prisma.invoice.findMany({
                  where: {
                     AND: [
                        { customerId: lease?.customerId },
                        { 
                           invoiceCreated: {
                              lte: new Date(date)
                           } 
                        }
                     ]
                  }
               });
               for(const invoice of invoices){
                  if(invoice.amountPaid <= invoice.invoiceAmount){
                     amountOwed += invoice.invoiceAmount - invoice.amountPaid;
                  }
               }
            }
            let sortingName = customer?.organizationName ? customer.organizationName : customer?.familyName;
            if(sortingName === null || sortingName === undefined){
               sortingName = ''
            }
            if(sortingName === '' && unit.unavailable){
               sortingName = 'unavailable';
            }
            const json = {
               'Unit number': humanUnitNum(unit.num),
               'Size': humanUnitSize(unit.size),
               'Family name': sortingName,
               'Given name': customer?.givenName ? customer.givenName : '',
               'Invoice due': customerInvoices[0]?.invoiceDue ? dayjs(customerInvoices[0].invoiceDue).format('MM/DD/YYYY') : '',
               'Leased price': unit.leasedPrice ? unit.leasedPrice : 0,
               'Advertised price': unit.advertisedPrice,
               'Lease Start': lease?.leaseEffectiveDate ? dayjs(lease.leaseEffectiveDate).format('MM/DD/YYYY') : '',
               'Date of Requested Report': date ? dayjs(date).format('MM/DD/YYYY') : '',
               'Amount Owed': amountOwed>0? amountOwed : '',
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
         customers = userSort(customers);
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
                  },
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
               unitNumbers.push(humanUnitNum(lease.unitNum));
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
            });
            const name =  customer.organizationName ? customer.organizationName : `${customer.givenName} ${customer.familyName}`
            const json = {
               'Name': name,
               'Units': unitNumbers.join(' '),
               'Phone number': address?.phoneNum1?.substring(0,3) + '.' + address?.phoneNum1?.substring(3,6) + '.' + address?.phoneNum1?.substring(6),
               'Earliest due date': customerInvoices[0] ? dayjs(earliestDue).format('MM/DD/YYYY') : '',
               'Amount due': totalDue,
            }
            csv.write(json);
            emit('message', `${name} added to CSV`)
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
               columns: [{key: 'code'}, {key: 'name'}, {key: 'phoneNumber'}, {key: 'group'}]
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
                  'code':'',
                  'name': name,
                  'phoneNumber': address.phoneNum1,
                  'group': user.employee ? 'employee' : 'General'
               }
               csv.write(json)
            }
         }
         csv.end();
         emit('csv', data.join(''));
         emit('message', 'CSV ready');
         return function cancel(){};
      }
      const currentLeaseReport = event.url.searchParams.get('currentLeaseReport');
      if(currentLeaseReport === 'true'){
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
                     leaseEnded: null
                  }
               }
            }
         });
         emit('message', 'Customers gathered');
         const data: any[] = [];
         const csv = stringify(
            {
               header: true,
               columns: [{key: 'Lease ID'}, {key: 'Customer name'}, {key: 'Unit num'}, {key: 'Lease effective day'}, {key: 'Price'}]
            },
         );
         csv.on('readable', () => {
            let row;
            while((row = csv.read()) !== null){
               data.push(row);
            }
         });
         for(const lease of leases){
            const customer = customers.find((customer) => customer.id === lease.customerId);
            const customerName = customer?.organizationName ? customer.organizationName : `${customer?.givenName} ${customer?.familyName}`
            const json = {
               'Lease ID': lease.leaseId,
               'Customer name': customerName,
               'Unit num': humanUnitNum(lease.unitNum),
               'Lease effective day': dayjs(lease.leaseEffectiveDate).format('D'),
               'Price': lease.price,
            }
            csv.write(json);
         }         
         csv.end();
         emit('csv', data.join(''));
         emit('message', 'CSV ready');
         return function cancel(){};
      }
      const pastDueCustomers = event.url.searchParams.get('pastDueCustomers');
      if(pastDueCustomers === 'true'){
         const invoices = await prisma.invoice.findMany({
            where: {
               AND: [
                  {
                     amountPaid: {
                        lt: prisma.invoice.fields.invoiceAmount
                     }
                  }, 
                  {
                     invoiceDue: {
                        lt: new Date()
                     }
                  }
               ]
            }
         })
      }
      return function cancel(){};
   })
};