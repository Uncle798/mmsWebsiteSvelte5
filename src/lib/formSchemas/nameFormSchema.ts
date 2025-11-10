import * as v from 'valibot'

export const nameFormSchema = v.object({
   familyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
   givenName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
   organizationName: v.nullable(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
});
export type NameFormSchema = typeof nameFormSchema;