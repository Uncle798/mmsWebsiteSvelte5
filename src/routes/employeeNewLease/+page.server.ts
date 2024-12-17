import { redirect } from '@sveltejs/kit';
import { fail, message, superValidate} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newLeaseSchema, registerFormSchema, addressFormSchema, leaseDiscountFormSchema  } from '$lib/formSchemas/schemas'
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import type { PartialUser } from '$lib/server/partialTypes';
import type { Address, DiscountCode } from '@prisma/client';
import { ratelimit } from '$lib/server/rateLimit';
import { stripe } from "$lib/server/stripe";
import dayjs from "dayjs";

export const load = (async (event) => {
   const unitNum = event.url.searchParams.get('unitNum');
   if(!unitNum){
      redirect(302, '/units/available');
   }
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   } 
   const leaseForm = await superValidate(zod(newLeaseSchema));
   const registerForm = await superValidate(zod(registerFormSchema));
   const addressForm = await superValidate(zod(addressFormSchema));
   const leaseDiscountForm = await superValidate(zod(leaseDiscountFormSchema));
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
      const leaseForm = await superValidate(event.request, zod(newLeaseSchema));
      console.log(leaseForm.data)
      if(!leaseForm.valid){
         message(leaseForm, 'Not valid');
      }
      const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(leaseForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      console.log()
      const customer = await prisma.user.findUnique({
         where: {
            id: leaseForm.data.customerId
         }
      })
      if(!customer){
         fail(404, leaseForm);
      }
      console.log(customer)
      const unit = await prisma.unit.findUnique({
         where: {
            num: leaseForm.data.unitNum
         }
      })
      if(!unit){
         fail(404, leaseForm)
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
         fail(400, {message: 'unable to find address'})
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
      if(discount){
         price = unit!.advertisedPrice - discount.amountOff
      }
      const lease = await prisma.lease.create({
         data:{
            customerId: customer!.id,
            employeeId: employee!.id,
            unitNum: leaseForm.data.unitNum,
            price,
            addressId:address!.addressId,
            leaseEffectiveDate: new Date(),
         }
      })
      const invoice = await prisma.invoice.create({
         data:{
            invoiceAmount: unit!.deposit,
            customerId: lease.customerId,
            leaseId: lease.leaseId,
            invoiceNotes:'Deposit for unit ' + lease.unitNum.replace(/^0+/gm,''), 
         }
      })
      let name:string = `${customer!.givenName} ${customer!.familyName}`
      if(customer!.organizationName){
         name= customer!.organizationName;
      }
      const existingStripeCustomer = await stripe.customers.search({
         query: `email:'${customer!.email}'`
      })
      console.log(existingStripeCustomer.data[0])
      let stripeId:string | null =  null;
      if(existingStripeCustomer.data[0]){
         stripeId = existingStripeCustomer.data[0].id
      }
      if(existingStripeCustomer.data.length === 0){
         const stripeCustomer = await stripe.customers.create({
            name: name,
            email: customer!.email,
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
         console.log('stripeCustomer', stripeCustomer);
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
      redirect(303, `/newLease/payDeposit?invoiceNum=${invoice.invoiceNum}&stripeId=${stripeId}`)
   },
   selectCustomer: async (event ) => {
      if(!event.locals.user?.employee){
         redirect(302, '/login?toast=employee')
      }
      const formData = await event.request.formData();
      const unitNum = event.url.searchParams.get('unitNum')
      console.log(formData.get('customerId'))
      redirect(303, `/employeeNewLease?userId=${formData.get('customerId')}&unitNum=${unitNum}`)
   }
};