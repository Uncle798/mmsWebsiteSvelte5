import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { cuidIdFormSchema, newDiscountFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const newDiscountForm = await superValidate(valibot(newDiscountFormSchema));
   const discountEndForm = await superValidate(valibot(cuidIdFormSchema));
   const discounts = await prisma.discountCode.findMany({
      where: {
         discountEnded: null
      }
   });
   return { discounts, newDiscountForm, discountEndForm };
}) satisfies PageServerLoad;