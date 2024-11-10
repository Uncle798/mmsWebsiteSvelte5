import { message, superValidate } from 'sveltekit-superforms';
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