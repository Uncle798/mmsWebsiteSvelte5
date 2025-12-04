import * as v from 'valibot';

export const leaseChangeFormSchema = v.object({
   leaseId: v.pipe(v.string(), v.cuid2()),
   price: v.optional(v.pipe(v.number())),
   unitNum: v.optional(v.pipe(v.string(), v.minLength(3), v.maxLength(9))),
   leaseEffectiveDate: v.optional(v.date()),
   leaseCreatedAt: v.optional(v.date()),
   depositAmount: v.optional(v.number()),
   discountId: v.optional(v.pipe(v.string(), v.cuid2())),
   keysProvided: v.optional(v.number()),
});
export type LeaseChangeFormSchema = typeof leaseChangeFormSchema;