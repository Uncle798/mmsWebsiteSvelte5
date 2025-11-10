import * as v from 'valibot';


export const newDiscountFormSchema = v.object({
   code: v.pipe(v.string(), v.minLength(8), v.maxLength(255)),
   amountOff: v.pipe(v.number(), v.minValue(1)),
   percentage: v.boolean(),
   notes: v.nullable(v.string())
});
export type NewDiscountFormSchema = typeof newDiscountFormSchema;
