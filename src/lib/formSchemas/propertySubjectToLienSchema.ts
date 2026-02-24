import * as v from 'valibot';
import { addressFormSchema } from './addressFormSchema';


export const propertySubjectToLienSchema = v.object({
   description: v.string(),
   leaseId: v.pipe(v.string(), v.cuid2()),
   email: v.optional(v.pipe(v.string(), v.email())),
   familyName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   givenName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   ...addressFormSchema.entries,
});
export type PropertySubjectToLienSchema = typeof propertySubjectToLienSchema;