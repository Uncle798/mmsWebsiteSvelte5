import * as v from 'valibot';

export const leaseDeleteFormSchema = v.pipe(
   v.object({
      leaseId: v.pipe(v.string(), v.cuid2()),
      confirm: v.pipe(v.string(), v.cuid2()),
   }),
   v.rawCheck(({dataset, addIssue}) => {
      if(dataset.typed){
         if(dataset.value.confirm !== dataset.value.leaseId){
            addIssue({
               message: 'Please submit the correct lease ID',
               path: [{
                  type: 'object',
                  origin: 'value',
                  input: dataset.value,
                  key: 'confirm',
                  value: dataset.value.confirm
               }]
            })
         }
      }
   })
);
export type LeaseDeleteFormSchema = typeof leaseDeleteFormSchema;