import * as v from 'valibot';
import { States } from '../../generated/prisma/enums';

export const alternativeContactFormSchema = v.object({
   familyName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   givenName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   email: v.optional(v.pipe(v.string(), v.email())),
   address1: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   address2: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   city: v.optional(v.string()),
   state: v.optional(v.enum(States)),
   postalCode: v.optional(v.pipe(v.string(), v.minLength(5), v.maxLength(9))),
   country: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
   phoneNum1: v.optional(v.pipe(v.string(), v.minLength(10), v.maxLength(14))),
   phoneNum1Country: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
   leaseId: v.optional(v.pipe(v.string(), v.cuid2())),
});
export type AlternativeContactFormSchema = typeof alternativeContactFormSchema;
