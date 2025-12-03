import * as v from 'valibot';
enum RecordTypes {
   invoice = 'invoice',
   payment = 'payment',
   refund = 'refund',
}

export const deleteRecordFormSchema = v.pipe(
   v.object({
      recordNum: v.pipe(v.number(), v.minValue(1)),
      confirmRecordNum: v.pipe(v.number(), v.minValue(1)),
      recordType: v.enum(RecordTypes)
   }),
   // v.rawCheck(({dataset, addIssue}) => {
   //    if(dataset.typed){
   //       if(dataset.value.recordNum !== dataset.value.confirmRecordNum){
   //          addIssue({
   //             message: 'Please type the correct record number',
   //             path: [{
   //                type: 'object',
   //                origin: 'value',
   //                input: dataset.value,
   //                key: 'confirmRecordNum',
   //                value: dataset.value.confirmRecordNum
   //             }]
   //          });
   //       }
   //    }
   // }),
);
export type DeleteRecordFormSchema = typeof deleteRecordFormSchema;