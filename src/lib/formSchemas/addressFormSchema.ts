import * as v from 'valibot';


export const addressFormSchema = v.object({
   organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   address1: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
   address2: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   city: v.string(),
   state: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
   postalCode: v.pipe(v.string(), v.minLength(5), v.maxLength(9)),
   country: v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
   phoneNum1: v.pipe(v.string(), v.minLength(10), v.maxLength(14)),
   phoneNum1Country: v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
   userId: v.pipe(v.string(), v.cuid2()),
});
export type AddressFormSchema = typeof addressFormSchema;
