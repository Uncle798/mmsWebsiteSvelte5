import * as v from 'valibot';


export const emailVerificationFormSchema = v.object({
   code: v.pipe(v.string(), v.minLength(8), v.maxLength(8))
});
export type EmailVerificationFormSchema = typeof emailVerificationFormSchema;
