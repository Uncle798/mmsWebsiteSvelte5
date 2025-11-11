import * as v from 'valibot'
import { PaymentType } from "@prisma/client";

export const newLeaseSchema = v.object({
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   organization: v.boolean(),
   discountId: v.optional(v.pipe(v.string(), v.cuid2())),
   customerId: v.pipe(v.string(), v.cuid2()),
   alternativeContactId: v.optional(v.pipe(v.string(), v.cuid2())),
   paymentType: v.enum(PaymentType),
})
export type NewLeaseSchema = typeof newLeaseSchema;