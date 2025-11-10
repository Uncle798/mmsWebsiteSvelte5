import { PaymentType } from '@prisma/client';
import * as v from 'valibot';


export const refundFormSchema = v.object({
   paymentRecordNumber: v.pipe(v.number(), v.minValue(1)),
   amount: v.pipe(v.number(), v.minValue(1)),
   notes: v.optional(v.string()),
   refundType: v.enum(PaymentType)
});
export type RefundFormSchema = typeof refundFormSchema;
