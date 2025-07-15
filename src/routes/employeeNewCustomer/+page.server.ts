import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';
import { newLeaseSchema } from '$lib/formSchemas/schemas'
import type { User } from '@prisma/client';

export const load = (async (event) => {
   const registerForm = await superValidate(valibot(registerFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const userId = event.url.searchParams.get('userId');
   let customer:User | null = null;
   if(userId){
      customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
   }
   return { registerForm, customer, emailVerificationForm};
}) satisfies PageServerLoad;