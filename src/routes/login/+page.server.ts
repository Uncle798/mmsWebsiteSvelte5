import { fail, superValidate, message } from 'sveltekit-superforms';
import { prisma } from '$lib/server/prisma';
import { ratelimit } from '$lib/server/rateLimit';
import { verify } from '@node-rs/argon2';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/formSchemas/schemas';
import { createSession, generateEmailVerificationRequest, generateSessionToken, setSessionTokenCookie } from '$lib/server/authUtils';
import { redirect } from '@sveltejs/kit';
import { sendVerificationEmail } from '$lib/server/mailtrap';

export const load:PageServerLoad = (async (event) => {
    const loginForm = await superValidate(zod(loginSchema));
    const toast = await event.url.searchParams.get('toast');
    return { loginForm, toast };
})

export const actions:Actions = {
    default: async (event) =>{
        const formData = await event.request.formData();
        const loginForm = await superValidate(formData, zod(loginSchema));
        if(!loginForm.valid){
            return fail(400, {loginForm})
        }
        const { success, reset } = await ratelimit.login.limit(event.getClientAddress())
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(loginForm, `Please wait ${timeRemaining}s before trying again.`)
		}
        const user = await prisma.user.findFirst({
            where: {
                email: loginForm.data.email
            },
            omit:{
                passwordHash:false,
            }
        });
        if(!user){
            return message(loginForm, 'Invalid username or password');
        }
        const checkedPass = await verify(user.passwordHash!, loginForm.data.password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });
        if(!checkedPass){
            return message(loginForm, 'Invalid username or password');
        }
        const token = generateSessionToken();
        const session = await createSession(token, user.id);
        setSessionTokenCookie(event, token, session.expiresAt);
        console.log(user);
        if(!user.emailVerified){
            const code = await generateEmailVerificationRequest(user.id, user.email!);
            sendVerificationEmail(code, user.email!);
            redirect(302, '/register/emailVerification')
        }
        redirect(302,'/');
    }
}   