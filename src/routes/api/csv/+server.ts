import { redirect } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Invoice, Lease, User } from '../../../generated/prisma/client';
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
                        customerInvoices: true,
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
                        customerInvoices: true
                     }
                  }
               }
            });
         }
         emit('message', 'Leases gathered');
         const data:string[] = [];
         const csv = stringify({
            header: true,
            columns: [
               {key: 'Unit number'},
               {key: 'Size'},
               {key: 'Advertised price'},
               {key: 'Notes'},
               {key: 'Leased price'},
               {key: 'Family name'},
               {key: 'Given name'},
               {key: 'Invoice due'},
               {key: 'Total Amount Owed'},
               {key: 'Lease Start'},
               {key: 'Date of Requested Report'}
            ]
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
            emit('message', `${humanUnitNum(unit.num)} customer being gathered`);
            if(customer){
               const invoices = lease?.customer.customerInvoices;
               if(invoices){
                  for(const invoice of invoices){
                     if(invoice.amountPaid <= invoice.invoiceAmount){
                        amountOwed += invoice.invoiceAmount - invoice.amountPaid;
                     }
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
               'Notes': unit.notes,
            }
            csv.write(json);
            emit('message', `${humanUnitNum(unit.num)} added`)
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
            columns: [
               {key: 'Organization Name'}, 
               {key: 'Family Name'}, 
               {key: 'Given Name'}, 
               {key: 'Phone number'}, 
               {key: 'Email'}, 
               {key: 'Address 1'}, 
               {key: 'Address 2'}, 
               {key: 'City'}, 
               {key: 'State'}, 
               {key: 'Postal Code'}, 
               {key: 'Units'},
               {key: 'Earliest due date'}, 
               {key: 'Amount due'},
               {key: 'Lease Start Dates'},
               {key: 'Notes'},
               {key: 'Do Not Rent'},
            ]
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
            const customerLeases = leases.filter((lease) => lease.customerId === customer.id);
            let leaseStartDates = '';
            for(const lease of customerLeases){
               unitNumbers.push(humanUnitNum(lease.unitNum));
               leaseStartDates = leaseStartDates.concat(dayjs(lease.leaseEffectiveDate).format('MM-DD-YYYY'));
               console.log(leaseStartDates);
               if(customerLeases.length > 1){
                  leaseStartDates = leaseStartDates.concat('; ');
               }
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
            const json = {
               'Organization Name': customer.organizationName,
               'Family Name': customer.familyName,
               'Given Name': customer.givenName,
               'Email': customer.email,
               'Phone number': address?.phoneNum1 ? address?.phoneNum1?.substring(0,3) + '.' + address?.phoneNum1?.substring(3,6) + '.' + address?.phoneNum1?.substring(6) : '',
               'Address 1': address?.address1 ? address.address1 : '',
               'Address 2': address?.address2 ? address.address2 : '',
               'City': address?.city ? address.city : '',
               'State': address?.state ? address.state : '',
               'Postal Code': address?.postalCode ? address.postalCode : '',
               'Units': unitNumbers.length > 1 ? unitNumbers.join('; ') : unitNumbers[0],
               'Lease Start Dates': leaseStartDates,
               'Earliest due date': customerInvoices[0] ? dayjs(earliestDue).format('MM/DD/YYYY') : '',
               'Amount due': totalDue,
               'Notes': customer.customerNotes,
               'Do Not Rent': customer.doNotRent ? 'Do Not Rent': '',
            }
            const name = customer.organizationName ? customer.organizationName : `${customer.familyName}, ${customer.givenName}`
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
      const unitsBySize = event.url.searchParams.get('unitsBySize');
      if(unitsBySize === 'true'){
         const units = await prisma.unit.findMany();
         emit('message', 'Units gathered');
         const dateOfRequest = event.url.searchParams.get('date');
         let date = new Date();
         if(dateOfRequest){
            date = new Date(dateOfRequest);
         }
         const data:string[] = [];
         const monthlyRentKey = 'Rent Revenue As of '.concat(dayjs(date).format('MM-DD-YYYY'))
         const csv = stringify(
            {
               header: true,
               columns: [{key: 'Size'}, {key: '# of Units'}, {key: '%'}, {key: 'SF'}, {key: 'Total SF of Size'}, {key: monthlyRentKey}, {key: '# Vacant'}]
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
         const leases = await prisma.lease.findMany({
            where: {
               OR: [
                  {
                     AND: [
                        { 
                           leaseEffectiveDate: {
                              lte: date
                           }
                        },
                        {
                           leaseEnded: {
                              gte: date
                           }
                        }
                     ]
                  },
                  {
                     AND: [
                        {
                           leaseEffectiveDate: {
                              lte: date
                           }
                        },
                        {
                           leaseEnded: null
                        }
                     ]
                  }
               ]
            }
         });
         emit('message', 'Leases gathered');
         const sizes: string[] = [];
         const numberPerSize: {size: string, amount: number}[] = [];
         const monthlyRent: {size: string, amount: number}[] = [];
         const numberVacant: {size: string, amount: number}[] = [];
         for(const unit of units){
            const lease = leases.find(lease => lease.unitNum === unit.num);
            if(sizes.indexOf(unit.size) === -1){
               sizes.push(unit.size);
               numberPerSize.push({size: unit.size, amount: 1});
            } else {
               numberPerSize[numberPerSize.findIndex(item => item.size === unit.size)].amount += 1;
            }
            if(lease){
               if(monthlyRent.findIndex(item => item.size === unit.size) === -1){
                  monthlyRent.push({size: unit.size, amount: lease.price});
               } else {
                  monthlyRent[monthlyRent.findIndex(item => item.size === unit.size)].amount += lease.price;
               }
            } else {
               if(numberVacant.findIndex(item => item.size === unit.size) === -1){
                  numberVacant.push({size: unit.size, amount: 1});
               } else {
                  numberVacant[numberVacant.findIndex(item => item.size === unit.size)].amount += 1;
               }
            }
            emit('message', `Unit ${humanUnitNum(unit.num)} analyzed`);
         }
         for(const size of sizes){
            emit('message', `${size} being added`);
            if(size.indexOf('x') >= 0){
               const x = parseInt(size.substring(0, size.indexOf('x')));
               const y = parseInt(size.substring(size.indexOf('x')+1));
               const amountOfUnits = numberPerSize[numberPerSize.findIndex(item => item.size === size)].amount;
               emit('message', `${size} amount of units: ${amountOfUnits.toString()}`);
               const sizeMonthlyRent = monthlyRent[monthlyRent.findIndex(item => item.size === size)].amount;
               emit('message', `${size} monthly rent: ${monthlyRent.toString()}`);
               const vacantCount = numberVacant[numberVacant.findIndex(item => item.size === size)].amount;
               emit('message', `${size} vacant count: ${vacantCount.toString()}`);
               const json = {
                  'Size': humanUnitSize(size),
                  '# of Units': amountOfUnits,
                  '%': Intl.NumberFormat().format(amountOfUnits / units.length),
                  'SF': x*y,
                  'Total SF of Size': (x*y)*amountOfUnits,
                  monthlyRentKey: sizeMonthlyRent,
                  '# Vacant': vacantCount,
               }
               csv.write(json);
               emit('message', `${humanUnitSize(size)} added to CSV`);
            }
         }
         csv.end();
         console.log(data.join(''));
         emit('csv', data.join(''));
         emit('message', 'CSV ready');
         return function cancel(){};
      }
      return function cancel(){};
   })
};