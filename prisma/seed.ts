import {  PrismaClient, PaymentType } from '@prisma/client';
import type { User,  Unit, Address, Lease, PaymentRecord, RefundRecord, DiscountCode, Invoice } from '@prisma/client'
import { faker } from '@faker-js/faker';
import dayjs  from 'dayjs';
import  unitData from './unitData'
import pricingData  from './pricingData'
import sizeDescription  from './sizeDescription'

const numUsers=unitData.length + 2000;
const earliestStarting = new Date('2020-01-01');

const prisma = new PrismaClient({
   log: [
     {
       emit: "event",
       level: "query",
     },
   ],
 });
 
// prisma.$on('query', e => {
//           console.log('Query: ' + e.query);
//           console.log('Params: ' + e.params);
//           console.log('Duration: ' + e.duration + 'ms');
//         });

const userData = Array.from({length:numUsers}).map(()=>({
   email: '',
   givenName: faker.person.firstName(),
   familyName: faker.person.lastName(),
   organizationName: '',
}));

async function deleteAll() {
   await prisma.refundRecord.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.paymentRecord.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.invoice.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.lease.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.discountCode.deleteMany().catch((err) => {
      console.error(err);
   })
   await prisma.unit.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.address.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.verification.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.session.deleteMany().catch((err) =>{
      console.error(err);
   });
   await prisma.user.deleteMany().catch((err) =>{
      console.error(err);
   });
   return true;
 }
 
 async function countAll() {
   let count = 0;
   count += await prisma.refundRecord.count();
   count += await prisma.paymentRecord.count();
   count += await prisma.invoice.count();
   count += await prisma.lease.count();
   count += await prisma.paymentRecord.count();
   count += await prisma.unit.count();
   count += await prisma.address.count();
   count += await prisma.user.count();
   return count;
 }

 function userMakeEmail() {
   for(let i = 0; i < userData.length; i++){
      const randString: string = String(Math.floor(Math.random() * 1001));
      const emailFront = userData[i].givenName + '.' + userData[i].familyName + randString;
      userData[i].email = emailFront.toLowerCase() + '@veryFakeEmail.com'.toLowerCase();
      if(i % 7 === 0){
         userData[i].organizationName = faker.company.name();
      }
   }
   for(const user of userData){
      const sameEmail = userData.filter((u) => u.email === user.email);
      if(sameEmail.length > 1){
         const randString:string=String(Math.floor(Math.random()*1001));
         const emailFront = user.givenName + '.' + user.familyName + randString;
         user.email = emailFront.toLowerCase() + 'yetAnotherFakeEmail.com'.toLowerCase();
      }
   }
}

async function createEmployees() {
   const employees: User[] = [];   
   // employees.push(
   //    await prisma.user.create({
   //       data:{
   //          email: String(process.env.GEORGE_EMAIL),
   //          emailVerified: true,
   //          givenName: 'George',
   //          familyName: 'Branson',
   //          address:{
   //             create:{
   //                address1: faker.location.streetAddress(), 
   //                city: faker.location.city(),
   //                state: faker.location.state({abbreviated: true}),
   //                postalCode: faker.location.zipCode(),
   //                country: 'US',
   //                phoneNum1: faker.helpers.fromRegExp('[0-9]{10}'),
   //                phoneNum1Country: '1',
   //             }
   //          },
   //          employee: true,
   //          admin: true
   //       }
   //    })
   // );
   employees.push(
      await prisma.user.create({
         data: {
            givenName: 'Eric',
            familyName: 'Branson',
            email: process.env.MY_EMAIL,
            emailVerified: true,
            employee: true,
            admin: true,
         }
      })
   )
   // employees.push(
   //    await prisma.user.create({
   //       data:{
   //          email: String(process.env.EMPLOYEE_EMAIL),
   //          emailVerified: true,
   //          givenName: 'Walter',
   //          familyName: 'Branson',
   //          address:{
   //             create:{
   //                address1: faker.location.streetAddress(), 
   //                city: faker.location.city(),
   //                state: faker.location.state({abbreviated: true}),
   //                postalCode: faker.location.zipCode(),
   //                country: 'US',
   //                phoneNum1: faker.helpers.fromRegExp('[0-9]{10}'),
   //                phoneNum1Country: '1',
   //             }
   //          },
   //          employee: true,
   //          admin: false
   //       }
   //    })
   // )
   return employees
}

function arrayOfMonths(startDate:Date, endDate:Date){
   const dateArray:Date[]=[];
   let currentDate = startDate;
   const numberOfMonths = dayjs(endDate).diff(startDate, 'months');
   for(let i=0; i<numberOfMonths; i++){
      dateArray.push(new Date(currentDate));
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth()+1));
   }
   return dateArray;
}

type PartialLease = Omit<Lease, 'leaseId' | 'leaseCreatedAt' | 'dropboxURL' | 'subscriptionId' | 'anvilEID'>

async function createLease(unit: Unit, leaseStart:Date, leaseEnd: Date | null, randEmployee: User, customer: User, address:Address, alternativeContact:User, discount?:DiscountCode, ) {
   const leaseEnded:Date | null = leaseEnd;
   const lease:PartialLease = {
      customerId: customer.id,
      employeeId: randEmployee.id,
      addressId: address.addressId,
      alternativeContactId: alternativeContact.id,
      unitNum: unit.num,
      price: discount ? unit.advertisedPrice-discount.amountOff : unit.advertisedPrice ,
      leaseEffectiveDate: leaseStart,
      leaseReturnedAt: leaseStart,
      leaseEnded,
      discountId: discount?.discountId ? discount.discountId : null,
      discountedAmount: discount?.amountOff ? discount.amountOff : null,
      keysProvided: 0,
   };
   return lease;
 }

 type PartialAddress = Omit<Address, 'addressId' | 'address2'>

 function makeAddresses(users:User[]){
   const addresses:PartialAddress[]=[]
   for(const user of users){
      const address:PartialAddress = {
         userId: user.id,
         address1: faker.location.streetAddress(), 
         city: faker.location.city(),
         state: faker.location.state({abbreviated: true}),
         postalCode: faker.location.zipCode(),
         country: faker.location.countryCode(),
         phoneNum1: faker.helpers.fromRegExp('[0-9]{10}'),
         phoneNum1Country: '1',
         phoneNum1Validated: false,
         softDelete: false
      }
      addresses.push(address);
   }
   return addresses;
 }

 type PartialUnit = Pick<Unit, 'size' | 'num' | 'building'>

 function makeUnit(unit:PartialUnit){
    const sD = sizeDescription.find((description) => description.size === unit.size);
    const price = pricingData.find((p) => p.size === unit.size);
    const newUnit:Unit= {} as Unit;
    if(unit.size === 'ours'){
         newUnit.building=unit.building;
         newUnit.num = unit.num;
         newUnit.size = unit.size;
         newUnit.leasedPrice =  0;
         newUnit.advertisedPrice = price?.price || 0;
         newUnit.deposit = price?.price || 5;
         newUnit.description = sD?.description ? sD.description : '';
         newUnit.unavailable = true;
      } else {
         newUnit.building=unit.building;
         newUnit.num = unit.num;
         newUnit.size = unit.size;
         newUnit.leasedPrice =  0;
         newUnit.advertisedPrice = price?.price || 0;
         newUnit.deposit = price?.price || 5;
         newUnit.description = sD?.description ? sD.description : '' 
         newUnit.unavailable = false;
    }
   return newUnit
 }

type PartialInvoice = Omit<Invoice, 'invoiceNum'>

function makeInvoice(lease:Lease, month:Date, deposit:boolean){
   let invoiceNotes:string ='';
   if(deposit){
      invoiceNotes = `Deposit for unit ${lease.unitNum.replace(/^0+/gm,'')}`
   } else {
      invoiceNotes = `Rent for unit ${lease.unitNum.replace(/^0+/gm,'')} for ${dayjs(month).format('MMMM YYYY')}`
   }
   const invoice:PartialInvoice = {
      customerId: lease.customerId,
      employeeId: lease.employeeId,
      leaseId: lease.leaseId,
      invoiceAmount: lease.price,
      invoiceCreated: month,
      invoiceNotes,
      deposit,
      invoiceDue: dayjs(month).add(1, 'month').toDate(),
      amountPaid: 0,
   };
   return invoice;
}

function makeLocalRefund(paymentRecord:PaymentRecord){
   const refund:Omit<RefundRecord, 'refundNumber'> = {
      customerId: paymentRecord.customerId,
      employeeId: paymentRecord.employeeId,
      refundAmount: paymentRecord.paymentAmount,
      paymentRecordNum: paymentRecord.paymentNumber,
      refundNotes: `Refund of payment record number ${paymentRecord.paymentNumber}.\n${paymentRecord.paymentNotes}`,
      refundCreated: dayjs(paymentRecord.paymentCreated).add(1, 'months').toDate(),
      refundCompleted: dayjs(paymentRecord.paymentCreated).add(1, 'months').toDate(),
      deposit: paymentRecord.deposit,
      refundType: paymentRecord.paymentType
   }
   return refund;
}

type PartialDiscount = Omit<DiscountCode, 'discountId' | 'discountCreated'>;

function makeDiscount(employee:User){
   const discount:PartialDiscount ={
      code: 'Test5Off',
      notes: 'This is a test amount off discount',
      amountOff: 5,
      userId: employee.id,
      percentage: false,
      discountEnded: null,
   }
   return discount
}

type PartialPaymentRecord = Omit<PaymentRecord, 'payee' | 'paymentNumber' | 'transactionId'>

async function  main (){
   const deleteStartTime = dayjs();
   await deleteAll();
   const deleteEndTime = dayjs();
   console.log(`📋 Previous records deleted in ${deleteEndTime.diff(deleteStartTime, 's')} seconds`);
   userMakeEmail();
   const users:User[] = await prisma.user.createManyAndReturn({
      data: userData
   });
   const addresses = makeAddresses(users);
   const dbContacts = await prisma.address.createManyAndReturn({
      data: addresses
   })
      await createEmployees();
   const totalUsers = await prisma.user.count();
   const userEndTime = dayjs();
   console.log(`👥 ${totalUsers} users created in ${userEndTime.diff(deleteEndTime, 's')} seconds`);
   const uD:Unit[]=[];
   for(const unit of unitData){
      const dbUnit = makeUnit(unit);
      uD.push(dbUnit);
   }
   const units = await prisma.unit.createManyAndReturn({
      data: uD
   })
   const unitEndTime = dayjs();
   console.log(`🚪 ${units.length} units created in ${unitEndTime.diff(userEndTime, 's')} seconds`);
   const leases:PartialLease[]=[];
   const employees = await prisma.user.findMany({
      where:{
         employee: true
      }
   })
   const discount = await prisma.discountCode.create({
      data: makeDiscount(employees[0])
   })
   for await (const unit of units) {
      let leaseStart = dayjs(earliestStarting).add(Math.floor(Math.random()*30), 'days');
      const today = dayjs();
      let numMonthsLeft = today.diff(leaseStart, 'months');
      let lengthOfLease = Math.floor(Math.random()*numMonthsLeft);
      const randEmployee = employees[Math.floor(Math.random()*employees.length)];
      let leaseEnd = leaseStart.add(lengthOfLease, 'months');
      let customer = users.pop();
      let alternativeContact = users.pop();
      if(!alternativeContact){
         break;
      }
      numMonthsLeft = today.diff(leaseStart, 'months');
      const discounted = Math.floor(Math.random()*100) >= 95
      if(!customer){
         break;
      }
      let contact = dbContacts.find((c) => c.userId === customer!.id);
      while(numMonthsLeft > 3 ){
         let lease:PartialLease;
         if(discounted){
            lease = await createLease(unit, leaseStart.toDate(), leaseEnd.toDate(), randEmployee, customer!, contact!, alternativeContact, discount);
         } else {
            lease = await createLease(unit, leaseStart.toDate(), leaseEnd.toDate(), randEmployee, customer!, contact!, alternativeContact)
         }
         leases.push(lease);
         customer = users.pop();
         alternativeContact = users.pop()
         if(!customer){
            break;
         }
         if(!alternativeContact){
            break;
         }
         contact = dbContacts.find((c) => c.userId === customer?.id);
         leaseStart = leaseEnd.add(2,'months');
         numMonthsLeft = today.diff(leaseStart, 'months');
         lengthOfLease = Math.floor(Math.random() * numMonthsLeft);
         if(lengthOfLease < 3) {
            lengthOfLease = 3;
         }
         leaseEnd = leaseStart.add(lengthOfLease, 'months').add(1,'day');
      } 
   }
   for (const lease of leases){
      const leaseEnd = dayjs(lease.leaseEnded);
      if(dayjs().diff(leaseEnd, 'months') < 4 || dayjs(leaseEnd).diff(new Date()) > 0 ){
         lease.leaseEnded = null;
      }
   }
   const dbLeases = await prisma.lease.createManyAndReturn({
      data: leases
   })
   const currentLeases = await prisma.lease.findMany({
      where: {
         leaseEnded: null
      }
   })
   for await(const lease of currentLeases){
      await prisma.unit.update({
         where: {
            num: lease.unitNum
         },
         data: {
            leasedPrice: lease.price
         }
      })
   }
   const availableUnits = await prisma.unit.findMany({
      where: {
         lease: {
            some: {
               leaseEnded: null
            }
         }
      }
   })
   let index = 0;
   for(const unit of availableUnits){
      if(index % 7 === 0){
         await prisma.unit.update({
            where: {
               num: unit.num
            },
            data: {
               unavailable: true,
               notes: `Need to fix the door`
            }
         })
      }
      index ++;
   }
   const leaseEndTime = dayjs();
   console.log(`🎫 ${leases.length} leases created in ${leaseEndTime.diff(unitEndTime, 'second')} seconds`);
   const invoices: PartialInvoice[] = [];
   for await (const lease of dbLeases){
      const leaseEndDate:Date | null = lease.leaseEnded ?? new Date();
      const months:Date[] = arrayOfMonths(lease.leaseEffectiveDate, leaseEndDate);
      let i = 0;
      for(const month of months) {
         let deposit = false;
         if(i === 0){
            deposit = true;
         }
         const invoice = makeInvoice(lease, month, deposit)
         invoices.push(invoice)
         i++;
      }
   }
   const dbInvoices = await prisma.invoice.createManyAndReturn({
      data: invoices,
   })
   const invoiceEndTime = dayjs();
   console.log(`💰 ${invoices.length} invoices created in ${invoiceEndTime.diff(leaseEndTime, 's')} seconds`);
   const paymentRecords:PartialPaymentRecord[]=[];
   for await (const invoice of dbInvoices){
      const paymentDate = dayjs(invoice.invoiceCreated).add(1, 'months');
      if(dayjs().diff(paymentDate, 'days') < 30) {
         continue;
      }
      const employee = employees[Math.floor(Math.random()*employees.length)];
      const randNum = Math.floor(Math.random()*3);
      const paymentType = PaymentType[Object.values(PaymentType)[randNum]];
      const record:PartialPaymentRecord = {
            paymentType: paymentType,
            customerId: invoice!.customerId!,
            paymentAmount: invoice.invoiceAmount, 
            employeeId: employee.id,
            paymentCreated: paymentDate.toDate(),         
            paymentCompleted: paymentDate.toDate(), 
            invoiceNum: invoice.invoiceNum, 
            paymentNotes: `Payment for invoice ${invoice.invoiceNum}\n ${invoice.invoiceNotes}`,
            deposit: invoice.deposit,
            refundedAmount: 0, 
         }      
      paymentRecords.push(record);
   }                              
   const dbPayments = await prisma.paymentRecord.createManyAndReturn({
      data: paymentRecords
   });
   const localRefunds:Omit<RefundRecord, 'refundNumber'>[] = [];
   for await(const record of dbPayments){
      await prisma.invoice.update({
         where: {
            invoiceNum: record.invoiceNum!,
         },
         data: {
            amountPaid: record.paymentAmount
         }
      });
      if(record.deposit){
         const invoice = dbInvoices.find((invoice) => invoice.invoiceNum === record.invoiceNum);
         const lease = dbLeases.find((lease) => lease.leaseId === invoice?.leaseId);
         if(lease?.leaseEnded){
            localRefunds.push(makeLocalRefund(record))
         }
      }
   }
   const dbRefunds = await prisma.refundRecord.createManyAndReturn({
      data: localRefunds
   });
   for(const refund of dbRefunds){
      await prisma.paymentRecord.update({
         where: {
            paymentNumber: refund.paymentRecordNum,
         },
         data: {
            refundedAmount: refund.refundAmount,
         }
      })
   }            
   const paymentEndTime = dayjs();
   const totalRecords = await countAll();
   console.log(`🧾 ${paymentRecords.length} payment records created in ${paymentEndTime.diff(invoiceEndTime, 'second')} seconds`);
   console.log(`🖥️  ${totalRecords} database entries created in ${paymentEndTime.diff(deleteStartTime, 'second')} seconds`);
   process.exit(0);
}


main().catch((error)=>{
   console.log(error);
   process.exit(1);
})
.finally(()=>{
   prisma.$disconnect();
});