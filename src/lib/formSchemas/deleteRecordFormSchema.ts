import * as v from 'valibot';
enum RecordTypes {
   invoice = 'invoice',
   payment = 'payment',
   refund = 'refund',
}

export const deleteRecordFormSchema = v.pipe(
   v.object({
      recordNum: v.pipe(v.number(), v.minValue(1)),
      confirm: v.pipe(v.number(), v.minValue(1)),
      recordType: v.enum(RecordTypes)
   }),
   v.rawCheck(({dataset, addIssue}) => {
      if(dataset.typed){
         if(dataset.value.recordNum !== dataset.value.confirm){
            addIssue({
               message: 'Please type the correct record number',
               path: [{
                  type: 'object',
                  origin: 'value',
                  input: dataset.value,
                  key: 'confirm',
                  value: dataset.value.confirm
               }]
            });
         }
      }
   }),
);
export type DeleteRecordFormSchema = typeof deleteRecordFormSchema;