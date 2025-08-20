import  {prisma} from "$lib/server/prisma";
import type { Actions, PageServerLoad } from './$types';
import {superValidate, message } from 'sveltekit-superforms';
import { addressFormSchema, leaseDiscountFormSchema, nameFormSchema, newLeaseSchema } from "$lib/formSchemas/schemas";
import { valibot } from 'sveltekit-superforms/adapters';
import { error, redirect } from "@sveltejs/kit";
import { ratelimit } from "$lib/server/rateLimit";
import { qStash } from "$lib/server/qStash";
import { PUBLIC_URL } from "$env/static/public";

export const load:PageServerLoad = (async (event) =>{
   const unitNum = event.url.searchParams.get('unitNum');
   if(!unitNum){
      redirect(302, '/units/available');
   }
   if(!event.locals.user){
      redirect(302, `/register?redirectTo=newLease&unitNum=${unitNum}&toast=register`)
   }
   if(!event.locals.user.emailVerified){
      redirect(302, `/register/emailVerification??redirectTo=newLease&unitNum=${unitNum}`)
   }
   const leaseForm = await superValidate(valibot(newLeaseSchema));
   const nameForm = await superValidate(valibot(nameFormSchema));
   const addressForm = await superValidate(valibot(addressFormSchema));
   const leaseDiscountForm = await superValidate(valibot(leaseDiscountFormSchema));
   const discountId = event.url.searchParams.get('discountId');
   const redirectTo = event.url.searchParams.get('redirectTo');
   
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum,
      }
   }).catch((err) =>{
      console.error(err);
   });

   const address = await prisma.address.findFirst({
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
      const leaseForm = await superValidate(event.request, valibot(newLeaseSchema));
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
      })
      const unit = await prisma.unit.findFirst({
         where:{
            num:leaseForm.data.unitNum,
         }
      }).catch((err) =>{
         console.error(err);
      })
      if(!unit){
         error(404, {message: 'Unit not found'})
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
      const address = await prisma.address.findFirst({
         where: {
            softDelete: false,
            userId: event.locals.user?.id
         }
      })
      if(!address){
         error(400, {message: 'unable to find address'})
      }
      const employees = await prisma.user.findMany({
         where:{
            employee: true,
         }
      })
      let discount;
      if(leaseForm.data.discountId){
         discount = await prisma.discountCode.findFirst({
            where: {
               discountId: leaseForm.data.discountId
            }
         })
      }
      let price = unit.advertisedPrice;
      let discountedAmount = 0;
      if(discount){
         if(discount.percentage){
            discountedAmount = unit.advertisedPrice * (discount.amountOff / 100)
         } else {
            discountedAmount - discount.amountOff
         }
      }
      price -= discountedAmount;
      const employee = employees[Math.floor(Math.random()*employees.length)];
      const lease = await prisma.lease.create({
         data:{
            customerId: customer!.id,
            employeeId: employee.id,
            unitNum: leaseForm.data.unitNum,
            price,
            addressId:address?.addressId,
            leaseEffectiveDate: new Date(),
            discountId: discount?.discountId,
            discountedAmount: discountedAmount
         }
      })
      await prisma.unit.update({
         where: {
            num: unit.num
         },
         data: {
            leasedPrice: price
         }
      })
      const invoice = await prisma.invoice.create({
         data:{
            invoiceAmount: unit.deposit,
            customerId: lease.customerId,
            leaseId: lease.leaseId,
            invoiceNotes:'Deposit for unit ' + lease.unitNum.replace(/^0+/gm,''),
            deposit: true,  
            invoiceDue: new Date()
         }
      });
      await qStash.trigger({
         url: `https://${PUBLIC_URL}/api/upstash/workflow`,
         body:  { leaseId:lease.leaseId },
         workflowRunId: lease.leaseId
      })
      redirect(303, `/makePayment?invoiceNum=${invoice.invoiceNum}&newLease=true&leaseId=${lease.leaseId}`)
   }
}
