import * as v from 'valibot';


export const searchFormSchema = v.object({
   search: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
});
export type SearchFormSchema = typeof searchFormSchema;
