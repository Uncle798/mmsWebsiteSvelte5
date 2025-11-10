import * as v from 'valibot';
import { nameFormSchema } from './nameFormSchema';
import { addressFormSchema } from './addressFormSchema';


export const propertySubjectToLienSchema = v.object({
   description: v.string(),
   leaseId: v.pipe(v.string(), v.cuid2()),
   email: v.pipe(v.string(), v.email()),
   ...nameFormSchema.entries,
   ...addressFormSchema.entries,
});
export type PropertySubjectToLienSchema = typeof propertySubjectToLienSchema;