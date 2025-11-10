import * as v from 'valibot';


export const creditCardFormSchema = v.object({
   ccNum: v.pipe(v.string(), v.creditCard()),
   cvv: v.pipe(v.string(), v.digits(), v.minLength(3), v.maxLength(4)),
   exp: v.pipe(v.string(), v.minLength(7), v.maxLength(7)),
   postalCode: v.pipe(v.string(), v.digits(), v.minLength(5), v.maxLength(5)),
   billingGivenName: v.string(),
   billingFamilyName: v.string(),
});
export type CreditCardFormSchema = typeof creditCardFormSchema;
