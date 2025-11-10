import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema } from '$lib/formSchemas/emailVerificationFormSchema';
import { registerFormSchema } from '$lib/formSchemas/registerFormSchema';
import { prisma } from '$lib/server/prisma';
import type { User } from '@prisma/client';

export const load = (async (event) => {
   const registerForm = await superValidate(valibot(registerFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const userId = event.url.searchParams.get('userId');
   const unitNum = event.url.searchParams.get('unitNum');
   let customer:User | null = null;
   if(userId){
      customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
   }
   return { registerForm, customer, emailVerificationForm, unitNum, };
}) satisfies PageServerLoad;