import * as v from 'valibot'

export const leaseEndFormSchema = v.object({
   leaseId: v.pipe(v.string(), v.cuid2()),
   customer: v.nullable(v.boolean()),
})
export type LeaseEndFormSchema = typeof leaseEndFormSchema;