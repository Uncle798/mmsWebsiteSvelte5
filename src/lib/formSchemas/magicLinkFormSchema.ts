import * as v from 'valibot';


export const magicLinkFormSchema = v.object({
   email: v.pipe(v.string(), v.minLength(5))
});
export type MagicLinkFormSchema = typeof magicLinkFormSchema;
