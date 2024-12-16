import { redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newLeaseSchema, registerFormSchema, addressFormSchema, leaseDiscountFormSchema  } from '$lib/formSchemas/schemas'
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

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
   
   const unit = await prisma.unit.findUnique({
      where: {
         num: unitNum,
      }
   })
   const customer = await prisma.user.findUnique


   return {
      leaseDiscountForm,
      leaseForm,
      registerForm, 
      addressForm, 
      discountId,
      redirectTo,
      users,
   };
}) satisfies PageServerLoad;