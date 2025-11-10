import * as v from 'valibot'

export const unitPricingFormSchema = v.object({
   size: v.pipe(v.string(), v.minLength(5), v.maxLength(8)),
   price: v.pipe(v.number(), v.integer(), v.minValue(1)),
   changeDeposit: v.boolean(),
   lowerPrice: v.boolean(),
});
export type UnitPricingFormSchema = typeof unitPricingFormSchema;