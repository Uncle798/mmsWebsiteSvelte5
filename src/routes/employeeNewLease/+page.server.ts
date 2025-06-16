
import { redirect } from '@sveltejs/kit';
import { fail, message, superValidate} from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { newLeaseSchema, registerFormSchema, addressFormSchema, leaseDiscountFormSchema  } from '$lib/formSchemas/schemas'
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import type { PartialUser } from '$lib/server/partialTypes';
import type { Address, DiscountCode } from '@prisma/client';
import { ratelimit } from '$lib/server/rateLimit';
import { stripe } from "$lib/server/stripe";
import dayjs from "dayjs";
import { qStash } from '$lib/server/qStash';
import { PUBLIC_URL } from '$env/static/public';
import { MY_EMAIL } from '$env/static/private';

export const load = (async (event) => {
   const unitNum = event.url.searchParams.get('unitNum');
   if(!unitNum){
      redirect(302, '/units/available');
   }
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   } 
   const leaseForm = await superValidate(valibot(newLeaseSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const addressForm = await superValidate(valibot(addressFormSchema));
   const leaseDiscountForm = await superValidate(valibot(leaseDiscountFormSchema));
   const discountId = event.url.searchParams.get('discountId');
   const redirectTo = event.url.searchParams.get('redirectTo');
   const userId = event.url.searchParams.get('userId');
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum
      }
   })
   let customer:PartialUser | null = null;
   let customers:PartialUser[] = [];
   let address:Address | null = null;
   let discount:DiscountCode | null = null;
   if(userId){
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
   if(!userId){
      customers = await prisma.user.findMany({
         where: {
            employee: false
         },
         orderBy: {
            familyName: 'asc'
         }
      })
   }
   return {
      leaseDiscountForm,
      leaseForm,
      registerForm, 
      addressForm, 
      discountId,
      redirectTo,
      customer,
      unit,
      address,
      discount,
      customers,
      unitNum
   };
}) satisfies PageServerLoad;

export const actions: Actions = {
   newLease: async (event) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const leaseForm = await superValidate(event.request, valibot(newLeaseSchema));
      if(!leaseForm.valid){
         message(leaseForm, 'Not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(leaseForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const customer = await prisma.user.findUnique({
         where: {
            id: leaseForm.data.customerId
         }
      })
      if(!customer){
         return fail(404, {leaseForm});
      }
      const unit = await prisma.unit.findUnique({
         where: {
            num: leaseForm.data.unitNum
         }
      })
      if(!unit){
         return fail(404, {leaseForm})
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
         return{}
      }
      const address = await prisma.address.findFirst({
         where: {
            softDelete: false,
            userId: customer.id
         }
      })
      if(!address){
         return fail(400, {leaseForm ,message: 'unable to find address'})
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
      })
      await prisma.unit.update({
         where: {
            num: lease.unitNum
         },
         data: {
            leasedPrice: lease.price
         }
      })
      await qStash.trigger({
         url: `${PUBLIC_URL}/api/upstash/workflow`,
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
         await prisma.invoice.update({
            where: {
               invoiceNum: invoice.invoiceNum
            },
            data: {
               paymentRecordNum: paymentRecord.paymentNumber
            }
         })
         redirect(302, `/employeeNewLease/leaseSent?leaseId=${lease.leaseId}`);
      }
      let name:string = `${customer!.givenName} ${customer!.familyName}`
      if(customer!.organizationName){
         name=customer!.organizationName;
      }
      const existingStripeCustomer = await stripe.customers.search({
         query: `email:'${customer!.email}'`
      })
      let stripeId:string | null =  null;
      if(existingStripeCustomer.data[0]){
         stripeId = existingStripeCustomer.data[0].id
      }
      if(existingStripeCustomer.data.length === 0){
         const stripeCustomer = await stripe.customers.create({
            name: name ? name : undefined,
            email: MY_EMAIL, // test mode
            // email: customer!.email ? customer?.email : undefined, // prod mode
            address: {
               line1: address!.address1,
               line2: address!.address2 ? address!.address2 : undefined,
               city: address!.city,
               state: address!.state,
               postal_code: address!.postalCode,
               country: address!.country,
            },
            description: `Unit number ${unit!.num.replace(/^0+/gm, '')} starting ${dayjs(lease.leaseCreatedAt).format('M/YYYY')}`,
            metadata: {
               customerId: customer!.id
            }
         })
         stripeId = stripeCustomer.id
      } else {
         await stripe.customers.update(existingStripeCustomer.data[0].id, {
            name: name,
            address: {
               line1: address!.address1,
               line2: address!.address2 ? address!.address2 : undefined,
               city: address!.city,
               state: address!.state,
               postal_code: address!.postalCode,
               country: address!.country,
            },
            description: `Unit number ${unit!.num.replace(/^0+/gm, '')} starting ${dayjs(lease.leaseCreatedAt).format('M/YYYY')}`,
            metadata: {
               customerId: customer!.id
            }
         })
      }
      await prisma.user.update({
         where: {
            id: customer!.id
         },
         data: {
            stripeId
         }
      })

      redirect(303, `/makePayment?invoiceNum=${invoice.invoiceNum}&stripeId=${stripeId}&newLease=true`)
   },
   selectCustomer: async (event ) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      const unitNum = event.url.searchParams.get('unitNum')
      redirect(303, `/employeeNewLease?userId=${formData.get('customerId')}&unitNum=${unitNum}`)
   }
};