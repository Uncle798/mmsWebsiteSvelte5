import * as v from 'valibot';

export const invoiceChangeFormSchema = v.object({
   invoiceNum: v.number(),
   invoiceNotes: v.optional(v.string()),
   
});
export type InvoiceChangeFormSchema = typeof invoiceChangeFormSchema;