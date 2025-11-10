import * as v from 'valibot';
import { PaymentType } from '@prisma/client';

export const paymentRecordSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   invoiceId: v.optional(v.pipe(v.string(), v.cuid2())),
   paymentAmount: v.pipe(v.number(), v.integer(), v.minValue(1)),
   payee: v.optional(v.string()),
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   paymentType: v.enum(PaymentType),
   paymentNote: v.optional(v.string())
});
export type PaymentRecordSchema = typeof paymentRecordSchema;
