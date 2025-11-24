import * as v from 'valibot';

export const alternativeContactFormSchema = v.object({
   familyName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   givenName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),   
   leaseId: v.pipe(v.string(), v.cuid2()),
   email: v.optional(v.pipe(v.string(), v.email())),
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
