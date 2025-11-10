
import * as v from 'valibot'

export const employmentFormSchema = v.object({
   employee: v.nullable(v.boolean()),
   admin: v.nullable(v.boolean()),
   userId: v.pipe(v.string(), v.cuid2()),
});
export type EmploymentFormSchema = typeof employmentFormSchema;