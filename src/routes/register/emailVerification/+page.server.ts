import { fail as superFormFail, message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema } from '$lib/formSchemas/schemas';
import { fail, redirect, } from '@sveltejs/kit';
import { ratelimit } from '$lib/server/rateLimit';
import { generateEmailVerificationRequest } from '$lib/server/authUtils';
import { sendVerificationEmail } from '$lib/server/mailtrap';

export const load = (async (event) => {
    const emailVerificationForm = await superValidate(zod(emailVerificationFormSchema));
    return { emailVerificationForm};
}) satisfies PageServerLoad;

export const actions: Actions ={
    verify: async(event) => {
        const formData = await event.request.formData();
        const emailVerificationForm = await superValidate(formData, zod(emailVerificationFormSchema));
        if(!emailVerificationForm.valid){
            return superFormFail(400, emailVerificationForm);
        }
        const { success, reset } = await ratelimit.emailVerification.limit(event.locals.user?.id || event.getClientAddress());
        if(!success) {
            const timeRemaining = Math.floor((reset - Date.now()) / 1000);
            return message(emailVerificationForm, `Please wait ${timeRemaining} seconds before trying again`);
        }

    },
    resend: async(event) =>{
        if(!event.locals.user){
            return fail(401, {
                resend: {
                    message: 'Not authenticated'
                }
            })
        }
        const { success, reset } = await ratelimit.emailVerification.limit(event.locals.user.id);
        if(!success){
            const timeRemaining = Math.floor((reset - Date.now()) / 1000);
            return fail(429, {
                resend:{
                    message: `Please wait ${timeRemaining} seconds before trying again`
                }
            })
        }
        if(!event.locals.user.email){
            redirect(301, '/register')
        }
        const code = await generateEmailVerificationRequest(event.locals.user.id, event.locals.user.email);
        sendVerificationEmail(code, event.locals.user.email);
        return { resend:{message:'A new code was sent to your email address'}}
    }
}