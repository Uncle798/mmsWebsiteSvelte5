import * as v from 'valibot';

export const newExpenseFormSchema = v.object({
   employeeId: v.pipe(v.string(), v.cuid2()),
   vendorId: v.pipe(v.string(), v.cuid2()),
   explanation: v.string(),
   amount: v.pipe(v.string(), v.decimal()),
   datePurchased: v.date(),
   receipt: v.pipe(v.file(), v.mimeType(['image/jpeg', 'image/png', 'application/pdf']), v.maxSize(1024*1024*10, 'Please upload a file smaller than 100mb'))
});
export type NewExpenseFormSchema = typeof newExpenseFormSchema;