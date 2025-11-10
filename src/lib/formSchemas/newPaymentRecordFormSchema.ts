import { PaymentType } from '@prisma/client';
import * as v from 'valibot';


export const newPaymentRecordFormSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   employeeId: v.pipe(v.string(), v.cuid2()),
   invoiceNum: v.nullable(v.pipe(v.number(), v.minValue(1))),
   paymentAmount: v.pipe(v.number(), v.minValue(1)),
   payee: v.optional(v.string()),
   paymentCompleted: v.boolean(),
   paymentNotes: v.optional(v.string()),
   paymentType: v.enum(PaymentType),
   cashOrCheck: v.boolean(),
   deposit: v.boolean(),
});
export type NewPaymentRecordFormSchema = typeof newPaymentRecordFormSchema;
