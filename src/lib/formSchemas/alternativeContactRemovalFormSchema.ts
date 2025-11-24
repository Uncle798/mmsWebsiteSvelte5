import * as v from 'valibot';

export const alternativeContactRemovalFormSchema = v.object({
   alternativeContactId: v.pipe(v.string(), v.cuid2()),
   leaseId: v.pipe(v.string(), v.cuid2()),
});
export type AlternativeContactRemovalFormSchema = typeof alternativeContactRemovalFormSchema;
