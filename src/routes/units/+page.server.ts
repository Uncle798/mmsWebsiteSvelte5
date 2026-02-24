import { prisma } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import { superValidate, message } from 'sveltekit-superforms'
import { ratelimit } from "$lib/server/rateLimit";
import { valibot } from 'sveltekit-superforms/adapters'
import { searchFormSchema } from '$lib/formSchemas/searchFormSchema';
import { unitPricingFormSchema } from "$lib/formSchemas/unitPricingFormSchema";
import { unitNotesFormSchema } from "$lib/formSchemas/unitNotesFormSchema";
import { leaseEndFormSchema } from "$lib/formSchemas/leaseEndFormSchema";
import type { PageServerLoad, Actions } from "./$types";

import pricingData from "$lib/server/pricingData";
import { changeDepositFormSchema } from "$lib/formSchemas/changeDepositFormSchema";

export const load:PageServerLoad = async (event) =>{ 
   if(!event.locals.user){
      throw redirect(302,'login?toast=unauthorized')
   }
   if(!event.locals.user.employee){
      throw redirect(302, '/units/available')
   }
   const unitPricingForm = await superValidate(valibot(unitPricingFormSchema), {id: 'pricingFrom'});
   const leaseEndForm = await superValidate(valibot(leaseEndFormSchema));
   const searchForm = await superValidate(valibot(searchFormSchema));
   const changeDepositForm = await superValidate(valibot(changeDepositFormSchema));
   const leases =  prisma.lease.findMany({
      where: {
         leaseEnded: null
      },
   });
   const customers = prisma.user.findMany();
   const addresses = prisma.address.findMany();
   const units = prisma.unit.findMany({
      orderBy: {
         num: 'asc'
      }
   });
   const unitNotesForms = await Promise.all((await prisma.unit.findMany()).map(async (unit) => {
      return await superValidate(valibot(unitNotesFormSchema), {id: unit.num});
   }));
   const sizes:string[] = []
   for(const datum of pricingData){
      if(datum.size !== 'ours'){
         sizes.push(datum.size)
      }
   }
   return {
      units,
      leases, 
      customers,
      unitNotesForms,
      unitPricingForm,
      changeDepositForm,
      leaseEndForm,
      searchForm,
      addresses,
      sizes
   }
}

export const actions:Actions = {
   unitNotesForm: async (event) => {
      const formData = await event.request.formData();
      const unitNotesForm = await superValidate(formData, valibot(unitNotesFormSchema));
      if(!unitNotesForm.valid){
         error(400);
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