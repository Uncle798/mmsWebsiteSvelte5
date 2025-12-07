import * as v from 'valibot';

export const onboardingCreateManyInvoicesFormSchema = v.object({
   leaseId: v.pipe(v.string(), v.cuid2()),
   startingDate: v.date(),
});
export type OnboardingCreateManyInvoicesFormSchema = typeof onboardingCreateManyInvoicesFormSchema