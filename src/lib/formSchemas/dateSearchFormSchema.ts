import * as v from 'valibot';


export const dateSearchFormSchema = v.object({
   startDate: v.optional(v.date()),
   endDate: v.optional(v.date())
});
export type DateSearchFormSchema = typeof dateSearchFormSchema;
