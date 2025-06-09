import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot, zod } from 'sveltekit-superforms/adapters';
import { registerFormSchema } from '$lib/formSchemas/schemas';
import type { PartialUser } from '$lib/server/partialTypes';
import { prisma } from '$lib/server/prisma';
import { newLeaseSchema } from '$lib/formSchemas/schemas'

export const load = (async (event) => {
   const registerForm = await superValidate(zod(registerFormSchema));
   const leaseForm = await superValidate(valibot(newLeaseSchema))
   const userId = event.url.searchParams.get('userId');
   let customer:PartialUser | null = null;
   if(userId){
      customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
   }
   return { registerForm, customer, leaseForm };
}) satisfies PageServerLoad;