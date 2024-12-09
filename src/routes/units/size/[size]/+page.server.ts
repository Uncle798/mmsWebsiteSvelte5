import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { unitPricingFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const unitPricingForm = await superValidate(zod(unitPricingFormSchema));
   const size = event.params.size
   
   const units = await prisma.unit.findMany({
      where: {
         size
      },
      orderBy: {
         num: 'asc'
      },
      include: {
         lease:{
            where: {
               leaseEnded: null
            },
            include: {
               customer: true,
            }
         }
      }
   })
   const allUnits = await prisma.unit.findMany({
      orderBy:{
         size: 'asc'
      },
      where:{
         size: {
            not: 'ours'
         }
      }
   });
   const sizes:string[] = [];
   allUnits.forEach((unit) =>{
      const unitSize = unit.size;
      const sizeSize = sizes.find((size) => size === unitSize);
      if(!sizeSize){
         sizes.push(unitSize);
      }
   })
   return { units, size, unitPricingForm, sizes };
}) satisfies PageServerLoad;