import { redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';
import { emailFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';
import { generateEmailVerificationRequest } from '$lib/server/authUtils';
import { sendVerificationEmail } from '$lib/server/mailtrap';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) =>{
        if(!event.locals.user){
            redirect(302, '/login?toast=unauthorized')
        }
        const formData = await event.request.formData();
        const emailForm = await superValidate(formData, zod(emailFormSchema));
        const { success, reset } = await ratelimit.customerForm.limit(event.getClientAddress())
          if(!success) {
              const timeRemaining = Math.floor((reset - Date.now()) /1000);
              return message(emailForm, `Please wait ${timeRemaining}s before trying again.`)
          }
        if(!emailForm.valid){
            return message(emailForm, 'not valid');
        }
        const user = await prisma.user.update({
            where: {
                id: event.locals.user.id
            },
            data: {
                email: emailForm.data.email,
                emailVerified: false,
            }
        })
        const code = await generateEmailVerificationRequest(event.locals.user.id, user.email!);
        sendVerificationEmail(code, user.email!);
        return message(emailForm, 'email updated successfully')
    }
};