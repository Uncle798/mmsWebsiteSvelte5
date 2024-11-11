import { message, superValidate } from 'sveltekit-superforms';
import { ratelimit } from "$lib/server/rateLimit";
import type { PageServerLoad, Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { nameFormSchema } from '$lib/formSchemas/schemas';
import { prisma } from '$lib/server/prisma';

export const load:PageServerLoad = (async () => {
    const nameForm = await superValidate(zod(nameFormSchema));
    return { nameForm};
})

export const actions: Actions = {
    default: async (event) =>{

        const formData = await event.request.formData();
        const nameForm = await superValidate(formData, zod(nameFormSchema));
        const { success, reset } = await ratelimit.register.limit(event.getClientAddress())
		if(!success) {
			const timeRemaining = Math.floor((reset - Date.now()) /1000);
			return message(nameForm, `Please wait ${timeRemaining}s before trying again.`)
		}
        await prisma.user.update({
            where:{
                id: event.locals.user?.id
            },
            data:{
                givenName: nameForm.data.givenName,
                familyName: nameForm.data.familyName
            }
        })
        return message(nameForm, 'Name updated successfully')
    }
};