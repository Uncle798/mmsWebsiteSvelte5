import * as v from 'valibot';
import { nameFormSchema } from './nameFormSchema';

export const alternativeContactFormSchema = v.object({
   ...nameFormSchema.entries,   
   email: v.pipe(v.string(), v.email()),
   leaseId: v.pipe(v.string(), v.cuid2()),
   organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   address1: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   address2: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   city: v.optional(v.string()),
   state: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   postalCode: v.optional(v.pipe(v.string(), v.minLength(5), v.maxLength(9))),
   country: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
   phoneNum1: v.optional(v.pipe(v.string(), v.minLength(10), v.maxLength(14))),
   phoneNum1Country: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
});
export type AlternativeContactFormSchema = typeof alternativeContactFormSchema;
