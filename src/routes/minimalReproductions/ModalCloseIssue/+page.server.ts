import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod'
import { zod } from 'sveltekit-superforms/adapters';
const formSchema = z.object({
    name: z.string().min(1).max(255),
});
const form2Schema = z.object({
    value: z.string().min(1).max(255),
    value2: z.string().min(1).max(255),
})

let name = '';
let value = 'value';
let value2 = 'value2';

export const load = (async () => {
    const form = await superValidate(zod(formSchema));
    const form2 = await superValidate(zod(form2Schema))
    return { form, form2, name, value, value2,  };
}) satisfies PageServerLoad;

export const actions: Actions = {
    form: async (event) =>{
        const formData = await event.request.formData();
        const form = await superValidate(formData, zod(formSchema));
        name = form.data.name;
        return { form };
    },
    form2: async (event) => {
        const form2 = await superValidate(await event.request.formData(), zod(form2Schema));
        value = form2.data.value;
        value2 = form2.data.value2;
        return { form2 }
    }
};