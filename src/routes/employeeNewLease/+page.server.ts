
import { error, redirect } from '@sveltejs/kit';
import { message, superValidate} from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { newLeaseSchema, registerFormSchema, addressFormSchema, leaseDiscountFormSchema, emailVerificationFormSchema, cuidIdFormSchema  } from '$lib/formSchemas/schemas'
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma'; 
import type { Address, DiscountCode, User } from '@prisma/client';
import { ratelimit } from '$lib/server/rateLimit';
import { qStash } from '$lib/server/qStash';
import { PUBLIC_URL } from '$env/static/public';
import { sendPaymentReceipt } from '$lib/server/mailtrap';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   } 
   const unitNum = event.url.searchParams.get('unitNum');
   const userId = event.url.searchParams.get('userId');
   if(!unitNum){
      redirect(302, `/units/available?userId=${userId}`);
   }
   const leaseForm = await superValidate(valibot(newLeaseSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema))
   const addressForm = await superValidate(valibot(addressFormSchema));
   const leaseDiscountForm = await superValidate(valibot(leaseDiscountFormSchema));
   const customerSelectForm = await superValidate(valibot(cuidIdFormSchema));
   const discountId = event.url.searchParams.get('discountId');
   const redirectTo = event.url.searchParams.get('redirectTo');
   const demoCookie = event.cookies.get('employeeNewLease');
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum
      }
   })
   let customer:User | null = null;
   let customers:User[] = [];
   let address:Address | null = null;
   let discount:DiscountCode | null = null;
   if(userId && userId !== 'null'){
      customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
      address = await prisma.address.findFirst({
         where: {
            AND:[
               { softDelete: false },
               { userId: customer?.id }
            ]
         }
      })
   }
   if(discountId){
      discount = await prisma.discountCode.findUnique({
         where: {
            discountId
         }
      })
   }
   if(!customer){
      customers = await prisma.user.findMany({
         where: {
            AND: [
               {
                  employee: false
               },
               {
                  doNotRent: false
               },
            ]
         },
         orderBy: {
            familyName: 'asc'
         },
      })
   }
   return {
      leaseDiscountForm,
      customerSelectForm, 
      leaseForm,
      registerForm, 
      emailVerificationForm,
      addressForm, 
      discountId,
      redirectTo,
      customer,
      unit,
      address,
      discount,
      customers,
      unitNum,
      demoCookie,
   };
}) satisfies PageServerLoad;

export const actions: Actions = {
   newLease: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const leaseForm = await superValidate(event.request, valibot(newLeaseSchema));
      console.log(leaseForm)
      if(!leaseForm.valid){
         return message(leaseForm, 'Not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(leaseForm, `Please wait ${timeRemaining}s before trying again.`);
		}
      const customer = await prisma.user.findUnique({
         where: {
            id: leaseForm.data.customerId
         }
      })
      if(!customer){
         return message(leaseForm, 'Customer not found');
      }
      if(customer.doNotRent){
         return message(leaseForm, `DO NO RENT TO ${customer.organizationName ? customer.organizationName.toUpperCase() : `${customer.givenName?.toUpperCase()} ${customer.familyName?.toUpperCase()}`}` )
      }
      const unit = await prisma.unit.findUnique({
         where: {
            num: leaseForm.data.unitNum
         }
      });
      if(!unit){
         return message(leaseForm, 'unit not found');
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
         return message(leaseForm, 'That unit is already leased');
      }
      const address = await prisma.address.findFirst({
         where: {
            softDelete: false,
            userId: customer.id
         }
      })
      if(!address){
         return message(leaseForm, 'Unable to find address'); 
      }
      const employee = await prisma.user.findUnique({
         where:{
            id: event.locals.user.id
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
      let price = unit!.advertisedPrice;
      let discountAmount = 0;
      if(discount){
         if(discount.percentage){
            discountAmount = (unit.advertisedPrice * (discount.amountOff / 100))
         } else {
            discountAmount = discount.amountOff
         }
      }
      price = unit.advertisedPrice - discountAmount
      const lease = await prisma.lease.create({
         data:{
            customerId: customer!.id,
            employeeId: employee!.id,
            unitNum: leaseForm.data.unitNum,
            price: price,
            addressId:address!.addressId,
            leaseEffectiveDate: new Date(),
            discountId: discount ? discount.discountId : undefined,
            discountedAmount: discount ? discountAmount : undefined
         }
      });
      await prisma.unit.update({
         where: {
            num: lease.unitNum
         },
         data: {
            leasedPrice: lease.price
         }
      });
      await qStash.trigger({
         url: `https://${PUBLIC_URL}/api/upstash/workflow`,
         body:  {leaseId:lease.leaseId},
         workflowRunId: lease.leaseId
      })
      const invoice = await prisma.invoice.create({
         data:{
            invoiceAmount: unit!.deposit,
            customerId: lease.customerId,
            leaseId: lease.leaseId,
            invoiceNotes:'Deposit for unit ' + lease.unitNum.replace(/^0+/gm,''), 
            deposit: true,
            invoiceDue: new Date(),
         }
      })

      if(leaseForm.data.paymentType === 'CASH' || leaseForm.data.paymentType === 'CHECK') {
         const paymentRecord = await prisma.paymentRecord.create({
            data: {
               invoiceNum: invoice.invoiceNum,
               paymentType: leaseForm.data.paymentType,
               paymentAmount: invoice.invoiceAmount,
               customerId: invoice.customerId!,
               paymentNotes: 'Payment for invoice ' + invoice.invoiceNum + ', ' + invoice.invoiceNotes,
               deposit: invoice.deposit,
               paymentCompleted: new Date()
            }
         })
         const dbInvoice = await prisma.invoice.update({
            where: {
               invoiceNum: invoice.invoiceNum
            },
            data: {
               amountPaid: invoice.amountPaid + paymentRecord.paymentAmount
            }
         });
         const emailResponse = await sendPaymentReceipt(customer, paymentRecord, address);  
         redirect(302, `/employeeNewLease/leaseSent?leaseId=${lease.leaseId}`);
      }
      redirect(303, `/makePayment?invoiceNum=${invoice.invoiceNum}&newLease=true`);
   },
   selectCustomer: async (event ) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee');
      }
      const formData = await event.request.formData();
      const unitNum = event.url.searchParams.get('unitNum')
      redirect(303, `/employeeNewLease?userId=${formData.get('cuidId')}&unitNum=${unitNum}`)
   }
};