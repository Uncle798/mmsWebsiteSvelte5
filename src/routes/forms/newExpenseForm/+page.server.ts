import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';

export const actions: Actions = {
    default: async (event) => {
        if(!event.locals.user.employee){
            redirect(302, '/login?toast=employee');
        }
        const formData = await event.request.formData();
        const newExpenseForm = await superValidate(formData, valibot(newExpenseFormSchema))
    }
};