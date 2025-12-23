import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { newExpenseFormSchema } from '$lib/formSchemas/newExpenseFormSchema';
import { newVendorFormSchema } from '$lib/formSchemas/newVendorFormSchema';
import type { User } from '../../../generated/prisma/client';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const vendors = await prisma.user.findMany({
      where: {
         vendor: true
      },
      orderBy: {
         organizationName: 'asc'
      }
   });
   const newExpenseForm = await superValidate(valibot(newExpenseFormSchema));
   const newVendorForm = await superValidate(valibot(newVendorFormSchema));
   const toastReason = event.url.searchParams.get('toast');
   let step = 0;
   const vendorId = event.url.searchParams.get('vendorId');
   let vendor:User | null = null;
   if(vendorId){
      vendor = await prisma.user.findUnique({
         where: {
            id: vendorId
         }
      })
   }
   if(vendor){
      step = 1
   }
   return { vendors, vendor, step, newExpenseForm, newVendorForm, toastReason, };
}) satisfies PageServerLoad;