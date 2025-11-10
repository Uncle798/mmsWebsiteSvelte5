import * as v from 'valibot';


export const leaseDiscountFormSchema = v.object({
   code: v.pipe(v.string(), v.minLength(8), v.maxLength(255)),
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(8)),
});
export type LeaseDiscountFormSchema = typeof leaseDiscountFormSchema;
