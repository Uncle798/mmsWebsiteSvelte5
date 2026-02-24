import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { expenseDeleteFormSchema } from '$lib/formSchemas/expenseDeleteFormSchema';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const expenseDeleteForm = await superValidate(valibot(expenseDeleteFormSchema));
   const expense = await prisma.expense.findUnique({
      where: {
         id: event.params.expenseId
      },
      include: {
         employee: true,
         vendor: true
      }
   });
   return { expense, expenseDeleteForm };
}) satisfies PageServerLoad;