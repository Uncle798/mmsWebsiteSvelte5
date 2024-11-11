import  {prisma} from "$lib/server/prisma";
import type { Actions, PageServerLoad } from './$types';
import {superValidate, message } from 'sveltekit-superforms';
import { addressFormSchema, nameFormSchema, newLeaseSchema } from "$lib/formSchemas/schemas";
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from "@sveltejs/kit";
import { ratelimit } from "$lib/server/rateLimit";
import { fail } from "assert";

export const load:PageServerLoad = (async (event) =>{
   if(!event.locals.user){
      redirect(302, '/login?redirectTo=newLease')
   }
   const leaseForm = await superValidate(zod(newLeaseSchema));
   const nameForm = await superValidate(zod(nameFormSchema));
   const addressForm = await superValidate(zod(addressFormSchema));
   const unitNum = event.url.searchParams.get('unitNum');
   if(!unitNum){
      redirect(302, '/units/available');
   }
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
   })
   return { leaseForm, address, addressForm, nameForm, unit }
})


export const actions:Actions = {
   default: async (event) =>{
      const leaseForm = await superValidate(event.request, zod(newLeaseSchema));
      if(!leaseForm.valid){
         message(leaseForm, 'no good')
      }
      const { success, reset } = await ratelimit.register.limit(event.getClientAddress())
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
      const currentLease = await prisma.lease.findFirst({
         where:{
            unitNum: unit?.num,
            leaseEnded: null,
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
         return fail('unable to find address')
      }
      const employees = await prisma.user.findMany({
         where:{
            employee: true,
         }
      })
      const employee = employees[Math.floor(Math.random()*employees.length)];
      const lease = await prisma.lease.create({
         data:{
            customerId: customer!.id,
            employeeId: employee.id,
            unitNum: leaseForm.data.unitNum,
            price:unit!.advertisedPrice,
            contactInfoId:address?.contactId,
            leaseEffectiveDate: new Date(),
         }
      })
      const invoice = await prisma.invoice.create({
         data:{
            invoiceAmount: lease.price,
            customerId: lease.customerId,
            leaseId: lease.leaseId,
            invoiceNotes:'Deposit for unit ' + lease.unitNum.replace(/^0+/gm,''), 
         }
      })
      redirect(302, '/newLease/payDeposit?invoiceId=' + invoice.invoiceId)
   }
}
