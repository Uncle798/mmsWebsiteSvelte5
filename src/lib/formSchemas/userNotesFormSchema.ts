
import * as v from 'valibot'

export const userNotesFormSchema = v.object({
   notes: v.nullable(v.string()),
   doNotRent: v.boolean(),
   userId: v.pipe(v.string(), v.cuid2())
})
export type UserNotesFormSchema = typeof userNotesFormSchema;