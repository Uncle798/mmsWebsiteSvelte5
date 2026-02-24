import * as v from 'valibot';

export const invoiceChangeFormSchema = v.object({
   invoiceNum: v.number(),
   invoiceNotes: v.optional(v.string()),
   invoiceAmount: v.optional(v.number()),
   invoiceDue: v.optional(v.date()),
   amountPaid: v.optional(v.number())
});
export type InvoiceChangeFormSchema = typeof invoiceChangeFormSchema;