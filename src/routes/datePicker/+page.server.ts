import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema } from '$lib/formSchemas/schemas';

export const load = (async () => {
   const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
   return { dateSearchForm };
}) satisfies PageServerLoad;