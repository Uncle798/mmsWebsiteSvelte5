import * as v from 'valibot';

export const changeDepositFormSchema = v.object({
   depositAmount: v.number(),
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   changeAll: v.boolean(),
})
export type ChangeDepositFormSchema = typeof changeDepositFormSchema;