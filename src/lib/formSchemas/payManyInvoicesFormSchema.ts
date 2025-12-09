import * as v from 'valibot';
import { PaymentType } from '../../generated/prisma/enums';

export const payManyInvoicesFormSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   paymentAmount: v.number(),
   paymentType: v.enum(PaymentType)
});
export type PayManyInvoicesFormSchema = typeof payManyInvoicesFormSchema;