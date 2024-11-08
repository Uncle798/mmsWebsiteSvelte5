import { prisma } from "$lib/server/prisma";
import { redirect} from '@sveltejs/kit';
import { ratelimit } from "$lib/server/rateLimit";
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import { createSession, generateEmailVerificationRequest, generateSessionToken, setSessionTokenCookie } from "$lib/server/authUtils";
import { registerFormSchema } from "$lib/formSchemas/schemas";
import { superValidate, message, fail } from 'sveltekit-superforms';
import { mailtrap } from "$lib/server/mailtrap";
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'


import type { PageServerLoad, Actions } from "./$types";

export const load:PageServerLoad = (async (event) =>{
	const unitNum = event.url.searchParams.get('unitNum');
   const registerForm = await superValidate(zod(registerFormSchema))
	
   return { unitNum, registerForm }
})


export const actions: Actions = {
   default: async(event) =>{
		const formData = await event.request.formData()
      const registerForm = await superValidate(formData, zod(registerFormSchema));
		if(!registerForm.valid){
			return fail(400, registerForm)
		}
		const { success, reset } = await ratelimit.register.limit(event.getClientAddress())
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(registerForm, `Please wait ${timeRemaining}s before trying again.`)
		}
		const validPass = registerForm.data.password;
		zxcvbnOptions.setOptions({
			translations: zxcvbnEnPackage.translations,
			graphs: zxcvbnCommonPackage.adjacencyGraphs,
			dictionary: {
				...zxcvbnCommonPackage.dictionary,
				...zxcvbnEnPackage.dictionary
			}
		})
		const passStrength = zxcvbn(validPass);
		if(passStrength.score < 3) {
			return message(registerForm, 'Please use a stronger password')
		}
		const validEmail = registerForm.data.email;
		const userAlreadyExists = await prisma.user.findUnique({
			where:{
				email: validEmail
			}
		})
		if(userAlreadyExists){
			if(userAlreadyExists.emailVerified === false){
				redirect(302, '/register/emailVerification')
			}
			redirect(302, '/login?toast=userAlreadyExists')
		}
		const hashedPass = await hash(validPass, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		const user = await prisma.user.create({
			data:{ 
				email: validEmail, 
				passwordHash: hashedPass
			}
		});
		const token = generateSessionToken();
		const session = await createSession(token, user.id);
		setSessionTokenCookie(event, token, session.expiresAt);
		const unitNum = event.url.searchParams.get('unitNum');
		if(unitNum){	
			redirect(302, `/register/emailVerification?unitNum=${unitNum}`);
		}
		redirect(302, `/register/emailVerification`);
   }
};