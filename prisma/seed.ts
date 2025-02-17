import {  PrismaClient, User, PaymentType, Unit, Address, Lease, PaymentRecord, } from '@prisma/client';
import { faker } from '@faker-js/faker';
import dayjs  from 'dayjs';
import  unitData from './unitData'
import pricingData  from './pricingData'
import sizeDescription  from './sizeDescription'
import { PartialAddress, PartialLease, PartialInvoice, PartialPaymentRecord, PartialUnit,  PartialDiscount } from '../src/lib/server/partialTypes'

const numUsers=unitData.length + 1500;
const earliestStarting = new Date('2018-01-01');

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
      const randString: string = String(Math.floor(Math.random() * 101));
      const emailFront = userData[i].givenName + '.' + userData[i].familyName + randString;
      if (i % 7 === 0) {
         userData[i].email = emailFront.toLowerCase() + '@veryFakeEmail.com'.toLowerCase();
         userData[i].organizationName = faker.company.name();
      } else if (i % 7 === 1) {
         userData[i].email = emailFront.toLowerCase() + '@sillyNotRealEmail.com'.toLowerCase();
      } else if (i % 7 === 2) {
         // cSpell:disable 
         userData[i].email = emailFront.toLowerCase() + '@blahblahblahEmail.com'.toLowerCase();
      } else if (i % 7 === 3) {
         userData[i].email = emailFront.toLowerCase() + '@horribleEmailAddress.com'.toLowerCase();
      } else if (i % 7 === 4) {
         userData[i].email = emailFront.toLowerCase() + '@emailemailemail.com';
      } else if (i % 7 === 5) {
         userData[i].email = emailFront.toLowerCase() + '@dumbfancyemail.com';
      } else if (i % 7 === 6) {
         userData[i].email = emailFront.toLowerCase() + '@sweetsweetemail.com';
      }
   }
   userData.forEach((user) =>{
      const sameEmail = userData.filter((u) => u.email === user.email);
      if(sameEmail.length > 1){
         const randString:string=String(Math.floor(Math.random()*101));
         const emailFront = user.givenName + '.' + user.familyName + randString;
         user.email = emailFront.toLowerCase() + 'yetanotherfakeemail.com';
         //cSpell:enable
      }
   })
}

async function createEmployees() {
   const employees: User[] = [];
   
   employees.push(
      await prisma.user.create({
         data:{
            email: String(process.env.GEORGE_EMAIL),
            emailVerified: true,
            givenName: 'George',
            familyName: 'Branson',
            address:{
               create:{
                  address1: faker.location.streetAddress(), 
                  city: faker.location.city(),
                  state: faker.location.state({abbreviated: true}),
                  postalCode: faker.location.zipCode(),
                  country: 'US',
                  phoneNum1: faker.phone.number(),
                  phoneNum1Country: '+1',
               }
            },
            employee: true,
            admin: true
         }
      })
   )
   employees.push(
      await prisma.user.create({
         data:{
            email: String(process.env.EMPLOYEE_EMAIL),
            emailVerified: true,
            givenName: 'Walter',
            familyName: 'Branson',
            address:{
               create:{
                  address1: faker.location.streetAddress(), 
                  city: faker.location.city(),
                  state: faker.location.state({abbreviated: true}),
                  postalCode: faker.location.zipCode(),
                  country: 'US',
                  phoneNum1: faker.phone.number(),
                  phoneNum1Country: '+1',
               }
            },
            employee: true,
            admin: false
         }
      })
   )
   return employees
}

// async function randomEmployee() {
//    const employees = await prisma.user.findMany({
//       where:{
//          employee: true
//       },
//       select: { id: true }
//    });
//    const employee = employees[Math.floor(Math.random() * employees.length)];
//    return employee;
// }
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

async function createLease(unit: Unit, leaseStart:Date, leaseEnd: Date | null, randEmployee: User, customer: User, address:Address) {
   const leaseEnded:Date | null = leaseEnd;
   const lease:PartialLease = {
       customerId: customer.id,
       employeeId: randEmployee.id,
       addressId: address.addressId,
       unitNum: unit.num,
       price: unit.advertisedPrice,
       leaseEffectiveDate: leaseStart,
       leaseReturnedAt: leaseStart,
       leaseEnded,
   };
   return lease;
 }

 function makeAddresses(users:User[]){
   const addresses:PartialAddress[]=[]
   users.forEach((user) =>{
      const address:PartialAddress = {
         userId: user.id,
         address1: faker.location.streetAddress(), 
         city: faker.location.city(),
         state: faker.location.state({abbreviated: true}),
         postalCode: faker.location.zipCode(),
         country: faker.location.countryCode(),
         phoneNum1: faker.phone.number(),
         phoneNum1Country: '+1'
      }
      addresses.push(address);
   });
   return addresses;
 }

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


function makeInvoice(lease:Lease, month:Date, deposit:boolean){
   let invoiceNotes:string ='';
   if(deposit){
      invoiceNotes = `Deposit for unit ${lease.unitNum.replace(/^0+/gm,'')}`
   } else {
      invoiceNotes = `Rent for unit ${lease.unitNum.replace(/^0+/gm,'')} for ${dayjs(month).format('MMMM YYYY')}`
   }
   const invoice:PartialInvoice = {
      customerId: lease.customerId,
      leaseId: lease.leaseId,
      invoiceAmount: lease.price,
      invoiceCreated: month,
      invoiceNotes,
      deposit,
   };
   return invoice;
}


async function makeRefund(paymentRecord:PaymentRecord){
   const refund = await prisma.refundRecord.create({
      data:{
         customerId: paymentRecord.customerId,
         employeeId: paymentRecord.employeeId,
         refundAmount: paymentRecord.paymentAmount,
         paymentRecordNum: paymentRecord.paymentNumber,
         refundType: paymentRecord.paymentType,
         refundNotes: `Refund of payment record number ${paymentRecord.paymentNumber}.\n${paymentRecord.paymentNotes}`,
         refundCreated: dayjs(paymentRecord.paymentCreated).add(1, 'months').toDate(),
         refundCompleted: dayjs(paymentRecord.paymentCreated).add(1, 'months').toDate(),
         deposit: paymentRecord.deposit
      }
   })
   await prisma.paymentRecord.update({
      where: {
         paymentNumber: paymentRecord.paymentNumber
      }, 
      data: {
         refunded: true,
         refundNumber: refund.refundNumber
      }
   })
   return refund
}

function makeDiscount(employee:User){
   const discount:PartialDiscount ={
      code: 'Test5Off',
      notes: 'This is a test amount off discount',
      amountOff: 5,
      userId: employee.id,
      percentage: false
   }
   return discount
}

async function  main (){
   const deleteStartTime = dayjs(new Date);
   await deleteAll();
   const deleteEndTime = dayjs(new Date);
   console.log(`📋 Previous records deleted in ${deleteEndTime.diff(deleteStartTime, 's')} sec`);
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
   const userEndTime = dayjs(new Date);
   console.log(`👥 ${totalUsers} users created in ${userEndTime.diff(deleteEndTime, 's')} sec`);
   const uD:Unit[]=[];
   unitData.forEach((unit)=>{
      const dbUnit = makeUnit(unit);
      uD.push(dbUnit);
   })
   const units = await prisma.unit.createManyAndReturn({
      data: uD
   })
   const unitEndTime = dayjs(new Date);
   console.log(`🚪 ${units.length} units created in ${unitEndTime.diff(userEndTime, 'ms')} ms`);
   const leases:PartialLease[]=[];
   const employees = await prisma.user.findMany({
      where:{
         employee: true
      }
   })
   for await (const unit of units) {
      let leaseStart = dayjs(earliestStarting);
      const today = dayjs();
      let numMonthsLeft = today.diff(leaseStart, 'months');
      let lengthOfLease = Math.floor(Math.random()*numMonthsLeft);
      const randEmployee = employees[Math.floor(Math.random()*employees.length)];
      let leaseEnd = leaseStart.add(lengthOfLease, 'months');
      let customer = users.pop();
      numMonthsLeft = today.diff(leaseStart, 'months');
      if(!customer){
         break
      }
      let contact = dbContacts.find((c) => c.userId === customer!.id);
      while(numMonthsLeft > 3 ){
         const lease = await createLease(unit, leaseStart.toDate(), leaseEnd.toDate(), randEmployee, customer!, contact!);
         leases.push(lease);
         customer = users.pop();
         if(!customer){
            break;
         }
         contact = dbContacts.find((c) => c.userId === customer?.id);
         leaseStart = leaseEnd.add(2,'months');
         numMonthsLeft = today.diff(leaseStart, 'months');
         lengthOfLease = Math.floor(Math.random() * numMonthsLeft);
         if(lengthOfLease < 3) {
            lengthOfLease = 3;
         }
         leaseEnd = leaseStart.add(lengthOfLease, 'months');
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
   currentLeases.forEach(async(lease)=>{
      await prisma.unit.update({
         where: {
            num: lease.unitNum
         },
         data: {
            leasedPrice: lease.price
         }
      })
   });
   const discount = makeDiscount(employees[0])
   await prisma.discountCode.create({
      data: discount
   })
   const leaseEndTime = dayjs(new Date);
   console.log(`🎫 ${leases.length} leases created in ${leaseEndTime.diff(unitEndTime, 'ms')} ms`);
   const invoices: PartialInvoice[] = [];
   for await (const lease of dbLeases){
      const leaseEndDate:Date | null = lease.leaseEnded ?? new Date;
      const months:Date[] = arrayOfMonths(lease.leaseEffectiveDate, leaseEndDate);
      let i = 0;
      for await (const month of months) {
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
   const invoiceEndTime = dayjs(new Date);
   console.log(`💰 ${invoices.length} invoices created in ${invoiceEndTime.diff(leaseEndTime, 's')} sec`);
   const paymentRecords:PartialPaymentRecord[]=[];
   for await (const invoice of dbInvoices){
      const paymentDate = dayjs(invoice.invoiceCreated).add(1, 'months');
      if(dayjs().diff(paymentDate, 'days') < 30) {
         continue;
      }
      const employee = employees[Math.floor(Math.random()*employees.length)];
      const randNum = Math.floor(Math.random()*3);
      const paymentType = PaymentType[Object.keys(PaymentType)[randNum]];
      const record:PartialPaymentRecord = {
            paymentType: paymentType,
            customerId: invoice!.customerId!,
            paymentAmount: invoice.invoiceAmount, 
            employeeId: employee.id,
            paymentCreated: paymentDate.toDate(),         
            paymentCompleted: paymentDate.toDate(), 
            invoiceNum: invoice.invoiceNum, 
            paymentNotes: `Payment for invoice ${invoice.invoiceNum}\n ${invoice.invoiceNotes}`,
            deposit: invoice.deposit
         }      
      paymentRecords.push(record);
   }                              
   const dbPayments = await prisma.paymentRecord.createManyAndReturn({
      data: paymentRecords
   });
   dbPayments.forEach(async (record) =>{
      await prisma.invoice.update({
         where: {
            invoiceNum: record.invoiceNum!,
         },
         data: {
            paymentRecordNum: record.paymentNumber,
         }
      });
      if(record.deposit){
         const invoice = dbInvoices.find((invoice) => invoice.invoiceNum === record.invoiceNum);
         const lease = dbLeases.find((lease) => lease.leaseId === invoice?.leaseId);
         if(lease?.leaseEnded){
             await makeRefund(record)
         }
      }
   })                     
   const paymentEndTime = dayjs(new Date);
   const totalRecords = await countAll();
   console.log(`🧾 ${paymentRecords.length} payment records created in ${paymentEndTime.diff(invoiceEndTime, 'second')} sec`);
   console.log(`🖥️  ${totalRecords} database entries created in ${paymentEndTime.diff(deleteStartTime, 'second')} sec`);
}


main().catch((error)=>{
   console.log(error);
   process.exit(1);
})
.finally(()=>{
   prisma.$disconnect();
});