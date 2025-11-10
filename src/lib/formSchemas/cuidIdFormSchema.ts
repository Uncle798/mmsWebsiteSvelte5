import * as v from 'valibot';


export const cuidIdFormSchema = v.object({
   cuid2Id: v.pipe(v.string(), v.cuid2())
});
export type CuidIdFormSchema = typeof cuidIdFormSchema;
