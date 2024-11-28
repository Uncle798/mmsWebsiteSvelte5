import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { discountEndFormSchema, newDiscountFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const newDiscountForm = await superValidate(zod(newDiscountFormSchema));
   const discountEndForm = await superValidate(zod(discountEndFormSchema));
   const discounts = await prisma.discountCode.findMany({
      include: {
         leases: true,
      }
   });
   console.log(discounts);
   return { discounts, newDiscountForm, discountEndForm };
}) satisfies PageServerLoad;