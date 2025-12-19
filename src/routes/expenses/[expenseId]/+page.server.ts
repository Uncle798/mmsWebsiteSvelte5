import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const expense = await prisma.expense.findUnique({
      where: {
         id: event.params.expenseId
      },
      include: {
         employee: true,
         vendor: true
      }
   });
   return { expense };
}) satisfies PageServerLoad;