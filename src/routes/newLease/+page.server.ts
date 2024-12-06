import  {prisma} from "$lib/server/prisma";
import type { Actions, PageServerLoad } from './$types';
import {superValidate, message } from 'sveltekit-superforms';
import { addressFormSchema, leaseDiscountFormSchema, nameFormSchema, newLeaseSchema } from "$lib/formSchemas/schemas";
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from "@sveltejs/kit";
import { ratelimit } from "$lib/server/rateLimit";
import { fail } from "@sveltejs/kit";

export const load:PageServerLoad = (async (event) =>{
   const unitNum = event.url.searchParams.get('unitNum');
   if(!unitNum){
      redirect(302, '/units/available');
   }
   if(!event.locals.user){
      redirect(302, `/login/magicLink?redirectTo=newLease&unitNum=${unitNum}`)
   }
   if(!event.locals.user.emailVerified){
      redirect(302, `/register/emailVerification??redirectTo=newLease&unitNum=${unitNum}`)
   }
   const leaseForm = await superValidate(zod(newLeaseSchema));
   const nameForm = await superValidate(zod(nameFormSchema));
   const addressForm = await superValidate(zod(addressFormSchema));
   const leaseDiscountForm = await superValidate(zod(leaseDiscountFormSchema));
   const discountId = event.url.searchParams.get('discountId');
   const redirectTo = event.url.searchParams.get('redirectTo');
   
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum,
      }
   }).catch((err) =>{
      console.error(err);
   });

   const address = await prisma.contactInfo.findFirst({
      where:{
         userId:event.locals.user.id
      }
   }).catch((err) =>{
      console.error(err);
   });
   if(discountId){
      const discount = await prisma.discountCode.findUnique({
         where: {
            discountId
         }
      })
      return { leaseForm, address, addressForm, nameForm, unit, leaseDiscountForm, redirectTo, discount }
   }
   return { leaseForm, address, addressForm, nameForm, unit, leaseDiscountForm, unitNum, redirectTo }
})


export const actions:Actions = {
   default: async (event) =>{
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized');
      }
      const leaseForm = await superValidate(event.request, zod(newLeaseSchema));
      if(!leaseForm.valid){
         message(leaseForm, 'no good')
      }
      const { success, reset } = await ratelimit.createLease.limit(event.locals.user.id);
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(leaseForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const customer = await prisma.user.findUniqueOrThrow({
         where:{
            id:event.locals.user?.id
         }
      }).catch((err) =>{
         console.error(err);
      })
      const unit = await prisma.unit.findFirst({
         where:{
            num:leaseForm.data.unitNum,
         }
      }).catch((err) =>{
         console.error(err);
      })
      if(!unit){
         return fail(404, {message: 'Unit not found'})
      }

      const currentLease = await prisma.lease.findFirst({
         where:{
            AND:[
               {unitNum: unit?.num},
               {leaseEnded: null},
            ]
         }
      }).catch((err) => {
         console.error(err);
      })
      if(currentLease){
         message(leaseForm, 'That unit is already leased');
      }
      const address = await prisma.contactInfo.findFirst({
         where: {
            softDelete: false,
            userId: event.locals.user?.id
         }
      })
      if(!address){
         return fail(400, {message: 'unable to find address'})
      }
      const employees = await prisma.user.findMany({
         where:{
            employee: true,
         }
      })
      const discount = await prisma.discountCode.findFirst({
         where: {
            discountId: leaseForm.data.discountId
         }
      })
      let price = unit.advertisedPrice;
      if(discount){
         price = unit.advertisedPrice - discount.amountOff
      }
      const employee = employees[Math.floor(Math.random()*employees.length)];
      const lease = await prisma.lease.create({
         data:{
            customerId: customer!.id,
            employeeId: employee.id,
            unitNum: leaseForm.data.unitNum,
            price,
            contactInfoId:address?.contactId,
            leaseEffectiveDate: new Date(),
         }
      })
      const invoice = await prisma.invoice.create({
         data:{
            invoiceAmount: unit.deposit,
            customerId: lease.customerId,
            leaseId: lease.leaseId,
            invoiceNotes:'Deposit for unit ' + lease.unitNum.replace(/^0+/gm,''), 
         }
      })
      redirect(302, '/newLease/payDeposit?invoiceNum=' + invoice.invoiceNum)
   }
}
