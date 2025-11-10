import * as v from 'valibot'

export const unitNotesFormSchema =  v.object({
   notes: v.nullable(v.string()),
   unavailable: v.boolean(),
   unitNum: v.pipe(v.string(), v.maxLength(7), v.minLength(3)),
});
export type  UnitNotesFormSchema = typeof unitNotesFormSchema;