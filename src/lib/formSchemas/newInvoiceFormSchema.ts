import * as v from 'valibot';

export const newInvoiceFormSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   employeeId: v.pipe(v.string(), v.cuid2()),
   invoiceNotes: v.string(),
   invoiceAmount: v.pipe(v.number(), v.gtValue(1)),
   leaseId: v.optional(v.pipe(v.string(), v.cuid2())),
   deposit: v.boolean(),
   invoiceDue: v.pipe(v.date()),
})
export type NewInvoiceFormSchema = typeof newInvoiceFormSchema;