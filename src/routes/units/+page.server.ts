import { prisma } from "$lib/server/prisma";
import { redirect, fail } from "@sveltejs/kit";
import { superValidate, message } from 'sveltekit-superforms'
import { ratelimit } from "$lib/server/rateLimit";
import { zod } from 'sveltekit-superforms/adapters'
import { unitNotesFormSchema, unitPricingFormSchema, endLeaseSchema } from "$lib/formSchemas/schemas";

import type { PageServerLoad, Actions } from "./$types";
import type { ContactInfo, Lease, Unit } from "@prisma/client";
import type { PartialUser } from "$lib/server/partialTypes";

export type UnitCustomer = Unit & PartialUser & Lease & ContactInfo;

export const load:PageServerLoad = async (event) =>{ 
   if(!event.locals.user){
      throw redirect(302,'login?toast=unauthorized')
   }
   if(!event.locals.user.employee){
      throw redirect(302, '/units/available')
   }
   if(event.locals.user.employee){
      const unitPricingForm = await superValidate(zod(unitPricingFormSchema), {id: 'pricingFrom'});
      const unitNotesForm = await superValidate(zod(unitNotesFormSchema), {id: 'unitNotesForm'});
      const leaseEndForm = await superValidate(zod(endLeaseSchema));
      const leases = await prisma.lease.findMany({
         orderBy: {
            unitNum: 'asc'
         },
         where: {
            leaseEnded: null
         },
      });
      const customers = await prisma.user.findMany()
      const units = await prisma.unit.findMany({
         orderBy: {
            num: 'asc'
         }
      });

      type SizePrice ={
         size: string,
         price: number,
      }
      const sizesPrices:SizePrice[]=[];
      units.forEach((unit) =>{
         const size = sizesPrices.find((s) => s.size === unit.size);
         if(!size){
            const sizePrice = {} as SizePrice;
            sizePrice.size = unit.size;
            sizePrice.price = unit.advertisedPrice;
            sizesPrices.push(sizePrice);
         }
      });
      sizesPrices.sort((a,b) => a.size > b.size ? 1 : 
      (b.size > a.size) ? -1 : 0);
      return {
         units,
         leases, 
         customers,
         sizesPrices,
         unitNotesForm,
         unitPricingForm,
         leaseEndForm
      }
   }
}

export const actions:Actions = {
   changePrice: async (event) => {
      const formData = await event.request.formData();
      const unitPricingForm = await superValidate(formData, zod(unitPricingFormSchema));
      if(!unitPricingForm.valid){
         return fail(400, {unitPricingForm});
      }
      const { success, reset } = await ratelimit.login.limit(event.locals.user?.id || event.getClientAddress())
		if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(unitPricingForm, `Please wait ${timeRemaining}s before trying again.`)
		}
      const unit = await prisma.unit.findFirst({
         where: {
            size: unitNotesFormSchema.data.size,
         }
      })
      if(!unit?.size){
         return message(unitPricingForm, 'Size of unit not found')
      }
         if(unitPricingForm.data.price < unit?.advertisedPrice && unitPricingForm.data.lowerPrice === null){
            return message(unitPricingForm, `Please select Lower Price to lower the price of all\
                ${unitPricingForm.data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units.` )
         }
         if(unitPricingForm.data.price === unit?.advertisedPrice && unitPricingForm.data.lowerPrice === null){
            return message(unitPricingForm, 
               `No change in price for ${unitPricingForm.data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units.` )
         }
      const units = await prisma.unit.updateMany({
         where: {
            size: unitPricingForm.data.size,
         },
         data: {
            advertisedPrice: unitPricingForm.data.price
         }
      })
      console.log(units)
      return { unitPricingForm }
   },
   unitNotesForm: async (event) => {
      const formData = await event.request.formData();
      const unitNotesForm = await superValidate(formData, zod(unitNotesFormSchema));
      if(!unitNotesForm.valid){
         return fail(400, {unitNotesForm});
      }
      const { success, reset } = await ratelimit.login.limit(event.locals.user?.id || event.getClientAddress())
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(unitNotesForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      await prisma.unit.update({
         where: {
            num: unitNotesForm.data.unitNum,
         },
         data:{
            unavailable: unitNotesForm.data.unavailable || false,
            notes: unitNotesForm.data.notes,
         }
      })
      return { unitNotesForm }
   },
}