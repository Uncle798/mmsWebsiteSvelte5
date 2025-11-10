import * as v from 'valibot'
import { nameFormSchema } from './nameFormSchema';

export const onboardingExistingLeaseSchema = v.object({
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   organization: v.boolean(),
   customerId: v.pipe(v.string(), v.cuid2()),
   addressId: v.pipe(v.string(), v.cuid2()),
   price: v.pipe(v.number(), v.minValue(1)),
   leaseEffectiveDate: v.date(),
   createdDate: v.date(),
   numKeys: v.nullable(v.number()),
   propertySubjectToLien: v.boolean(),
   ...nameFormSchema.entries,
})
export type OnboardingExistingLeaseSchema = typeof onboardingExistingLeaseSchema;