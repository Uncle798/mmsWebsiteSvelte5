import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { registerFormSchema } from '$lib/formSchemas/schemas';
import type { PartialUser } from '$lib/server/partialTypes';
import { prisma } from '$lib/server/prisma';
import { newLeaseSchema } from '$lib/formSchemas/schemas'

export const load = (async (event) => {
   const registerForm = await superValidate(zod(registerFormSchema));
   const leaseForm = await superValidate(zod(newLeaseSchema))
   const userId = event.url.searchParams.get('userId');
   let user:PartialUser | null = null;
   if(userId){
      user = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
   }
   return { registerForm, user, leaseForm };
}) satisfies PageServerLoad;