import * as v from 'valibot';
import { nameFormSchema } from './nameFormSchema';
import { addressFormSchema } from './addressFormSchema';

export const alternativeContactFormSchema = v.object({
   email: v.pipe(v.string(), v.email()),
   ...nameFormSchema.entries,
   ...addressFormSchema.entries,
});
export type AlternativeContactFormSchema = typeof alternativeContactFormSchema;
