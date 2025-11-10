import * as v from 'valibot';


export const emailFormSchema = v.pipe(
   v.object({
      email: v.pipe(v.string(), v.email()),
      confirmEmail: v.pipe(v.string(), v.email()),
   }),
   v.rawCheck(({ dataset, addIssue }) => {
      if (dataset.typed) {
         if (dataset.value.email !== dataset.value.confirmEmail) {
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
export type EmailFormSchema = typeof emailFormSchema;
