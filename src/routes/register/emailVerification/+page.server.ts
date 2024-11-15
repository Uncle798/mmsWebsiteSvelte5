import { fail as superFormFail, message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { emailVerificationFormSchema } from '$lib/formSchemas/schemas';
import { fail, redirect, } from '@sveltejs/kit';
import { ratelimit } from '$lib/server/rateLimit';
import { generateEmailVerificationRequest } from '$lib/server/authUtils';
import { sendVerificationEmail } from '$lib/server/mailtrap';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';

export const load:PageServerLoad = (async (event) => {
    if(!event.locals.user){
        return fail(401);
    }
    const emailVerificationForm = await superValidate(zod(emailVerificationFormSchema));
    const verification = await prisma.verification.findFirst({
        where: {
            userId: event.locals.user?.id
        }
    });
    if(!verification || verification?.expiresAt.getTime() >= Date.now() ){
        const code = await generateEmailVerificationRequest(event.locals.user.id, event.locals.user.email!);

        console.log(dayjs(new Date).format('HH:mm:ss')+" "+ code)
        sendVerificationEmail(code, event.locals.user.email!);
    }
    return { emailVerificationForm };
})

export const actions: Actions ={
    verify: async(event) => {
        if(!event.locals.user){
            return redirect(302, '/login')
        }
        if(event.locals.user.emailVerified){
            return redirect(302, '/');
        }
        const formData = await event.request.formData();
        const emailVerificationForm = await superValidate(formData, zod(emailVerificationFormSchema));
        if(!emailVerificationForm.valid){
            return superFormFail(400, emailVerificationForm);
        }
        console.log(emailVerificationForm)
        const { success, reset } = await ratelimit.emailVerification.limit(event.locals.user?.id || event.getClientAddress());
        if(!success) {
            const timeRemaining = Math.floor((reset - Date.now()) / 1000);
            return message(emailVerificationForm, `Please wait ${timeRemaining} seconds before trying again`);
        }
        const verification = await prisma.verification.findFirst({
            where: {
                userId: event.locals.user.id
            }
        })
        if(!verification){
            return fail(401, {verify:'Not authenticated'})
        }
        if(verification?.expiresAt.getTime() <= Date.now() ){
            console.log(verification.expiresAt +  " " + Date.now())
            const code = await generateEmailVerificationRequest(event.locals.user.id, event.locals.user.email!);
            sendVerificationEmail(code, event.locals.user.email!)
            console.log(dayjs(new Date).format('HH:mm:ss')+" "+ code)
            return message(emailVerificationForm, 'The code had expired, we\'ve sent a new code to the email address on file');
        }
        console.log(verification);
        if(verification.code !== emailVerificationForm.data.code){
            return message(emailVerificationForm, 'Code was invalid');
        }
        await prisma.verification.delete({
            where: {
                id: verification.id
            }
        })
        const user = await prisma.user.update({
            where: {
                id: event.locals.user.id
            },
            data: {
                emailVerified: true
            }
        })
        console.log(user);
        redirect(302, '/')
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
        console.log(dayjs(new Date).format('HH:mm:ss')+" "+ code)
        sendVerificationEmail(code, event.locals.user.email);
        return {  }
    }
}