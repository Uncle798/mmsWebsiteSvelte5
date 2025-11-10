import * as v from 'valibot';


export const registerFormSchema = v.pipe(
   v.object({
      familyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      givenName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
      email: v.pipe(v.string(), v.email()),
      emailConfirm: v.pipe(v.string(), v.email())
   }),
   v.rawCheck(({ dataset, addIssue }) => {
      if (dataset.typed) {
         if (dataset.value.email !== dataset.value.emailConfirm) {
            addIssue({
               message: 'Emails must match',
               path: [{
                  type: 'object',
                  origin: 'value',
                  input: dataset.value,
                  key: 'email',
                  value: dataset.value.email
               }]
            });
         }
      }
   })
);
export type RegisterFormSchema = typeof registerFormSchema;
