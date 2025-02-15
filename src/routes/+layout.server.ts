import { superValidate } from "sveltekit-superforms";
import type { LayoutServerLoad } from "./$types";
import { blankFormSchema } from "$lib/formSchemas/schemas";
import { zod } from "sveltekit-superforms/adapters";



export const load: LayoutServerLoad = async ({locals}) =>{
   const { user } = locals;
   const logOutForm = await superValidate(zod(blankFormSchema))
   return { user, logOutForm };
}