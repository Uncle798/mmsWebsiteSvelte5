import { prisma } from "$lib/server/prisma";
import { redirect, fail } from "@sveltejs/kit";
import { superValidate, message } from 'sveltekit-superforms'
import { ratelimit } from "$lib/server/rateLimit";
import { zod } from 'sveltekit-superforms/adapters'
import { unitNotesFormSchema, unitPricingFormSchema, leaseEndFormSchema } from "$lib/formSchemas/schemas";

import type { PageServerLoad, Actions } from "./$types";
import type { Address, Lease, Unit } from "@prisma/client";
import type { PartialUser } from "$lib/server/partialTypes";

export type UnitCustomer = Unit & PartialUser & Lease & Address;

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
      const leaseEndForm = await superValidate(zod(leaseEndFormSchema));
      const leases = await prisma.lease.findMany({
         orderBy: {
            unitNum: 'asc'
         },
         where: {
            leaseEnded: null
         },
         include: {
            customer: true,
            unit: true,
         }
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