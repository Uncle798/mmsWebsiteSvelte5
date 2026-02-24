import * as v from 'valibot'

export const onboardingExistingLeaseSchema = v.object({
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   organization: v.boolean(),
   customerId: v.pipe(v.string(), v.cuid2()),
   addressId: v.pipe(v.string(), v.cuid2()),
   price: v.pipe(v.number(), v.minValue(1)),
   createdDate: v.date(),
   numKeys: v.nullable(v.number()),
   deposit: v.number(),
   propertySubjectToLien: v.boolean(),
   familyName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   givenName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   organizationName: v.nullable(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
})
export type OnboardingExistingLeaseSchema = typeof onboardingExistingLeaseSchema;