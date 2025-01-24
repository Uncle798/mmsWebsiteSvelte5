import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { searchFormSchema } from '$lib/formSchemas/schemas';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const searchForm = await superValidate(zod(searchFormSchema));
   const refundCount = await prisma.refundRecord.count();
   const refunds = prisma.refundRecord.findMany({
      orderBy: {
         refundCompleted: {
            sort: 'desc',
            nulls: 'first'
         }
      },
      include: {
         customer: true,
      }
   })
   return { refunds, searchForm, refundCount };
}) satisfies PageServerLoad;

