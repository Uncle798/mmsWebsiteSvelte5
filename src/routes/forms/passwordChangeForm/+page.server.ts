import { redirect } from "@sveltejs/kit";
import { superValidate, message, fail } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { ratelimit } from "$lib/server/rateLimit";
import { hash } from '@node-rs/argon2';
import type { PageServerLoad, Actions } from "./$types";
import { passwordFormSchema } from "$lib/formSchemas/schemas";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { prisma } from "$lib/server/prisma";

export const load: PageServerLoad = async () => {
   
};

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized')
      }
      const formData = await event.request.formData();
      const passwordChangeForm = await superValidate(formData, zod(passwordFormSchema));
      if(!passwordChangeForm.valid){
         fail(500, passwordChangeForm)
      }
      const { success, reset } = await ratelimit.register.limit(event.locals.user.id)
      if(!success) {
         const timeRemaining = Math.floor((reset - Date.now()) /1000);
         return message(passwordChangeForm, `Please wait ${timeRemaining}s before trying again.`)
      }
      const validPass = passwordChangeForm.data.password;
      zxcvbnOptions.setOptions({
         translations: zxcvbnEnPackage.translations,
         graphs: zxcvbnCommonPackage.adjacencyGraphs,
         dictionary: {
            ...zxcvbnCommonPackage.dictionary,
            ...zxcvbnEnPackage.dictionary
         }
      })
      const passStrength = zxcvbn(validPass);
      if(passStrength.score < 3){
         return message(passwordChangeForm, 'Please use a stronger password');
      }
      const hashedPass = await hash(validPass, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
      await prisma.user.update({
         where: {
            id: event.locals.user.id
         },
         data: {
            passwordHash: hashedPass
         }
      })
      const { session } = event.locals
      await prisma.session.deleteMany({
         where: {
            AND:[
               { userId: event.locals.user.id},
               { id: {
                  not: session?.id
               } }
            ]
         }
      })
   }
};