import * as v from 'valibot';

export const expenseDeleteFormSchema = v.pipe(
   v.object({
      amount: v.pipe(v.string(), v.decimal()),
      confirmAmount: v.pipe(v.string(), v.decimal()),
      expenseId: v.pipe(v.string(), v.cuid2()),
   }),
   v.rawCheck(({ dataset, addIssue}) => {
      if(dataset.typed){
         if(dataset.value.amount !== dataset.value.confirmAmount){
            addIssue({
               message: 'Please enter the correct amount',
               path: [{
                  type: 'object',
                  origin: 'value',
                  input: dataset.value,
                  key: 'confirmAmount',
                  value: dataset.value.confirmAmount
               }]
            })
         }
      }
   })
);
export type ExpenseDeleteFormSchema = typeof expenseDeleteFormSchema;