import * as v from 'valibot';

export const newExpenseFormSchema = v.object({
   employeeId: v.pipe(v.string(), v.cuid2()),
   vendorId: v.pipe(v.string(), v.cuid2()),
   explanation: v.string(),
   amount: v.number()
});
export type NewExpenseFormSchema = typeof newExpenseFormSchema;