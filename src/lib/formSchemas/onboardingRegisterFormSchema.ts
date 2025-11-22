import * as v from 'valibot';


export const onboardingRegisterFormSchema = v.pipe(
   v.object({
      familyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      givenName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
      email: v.pipe(v.string(), v.email()),
   }),
);
export type OnboardingRegisterFormSchema = typeof onboardingRegisterFormSchema;
