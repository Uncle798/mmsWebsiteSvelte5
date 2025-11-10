import * as v from 'valibot';
import { nameFormSchema } from './nameFormSchema';
import { addressFormSchema } from './addressFormSchema';


export const propertySubjectToLienSchema = v.object({
   description: v.string(),
   nameFormSchema,
   addressFormSchema,
});
export type PropertySubjectToLienSchema = typeof propertySubjectToLienSchema;