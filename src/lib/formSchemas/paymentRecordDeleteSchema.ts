import * as v from 'valibot';


export const paymentRecordDeleteSchema = v.object({
   paymentRecordNumber: v.pipe(v.number(), v.minValue(1))
});
export type PaymentRecordDeleteSchema = typeof paymentRecordDeleteSchema;
