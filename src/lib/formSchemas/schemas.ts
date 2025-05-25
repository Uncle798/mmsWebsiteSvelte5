import { z } from "zod"
import * as v from 'valibot'

export const employmentFormSchema = z.object({
   employee: z.boolean().nullable(),
   admin: z.boolean().nullable(),
   userId: z.string().cuid2(),
});
export type EmploymentFormSchema = typeof employmentFormSchema;

export const unitPricingFormSchema = z.object({
   size: z.string().min(5).max(7).trim(),
   price: z.number().int().positive(),
   changeDeposit: z.boolean(),
   lowerPrice: z.boolean(),
});
export type UnitPricingFormSchema = typeof unitPricingFormSchema;

export const unitNotesFormSchema =  z.object({
   notes: z.string().nullable(),
   unavailable: z.boolean(),
   unitNum: z.string().min(3).max(6),
});
export type  UnitNotesFormSchema = typeof unitNotesFormSchema;

export const leaseEndFormSchema = z.object({
   leaseId: z.string().cuid2(),
   customer: z.boolean().nullable(),
})
export type LeaseEndFormSchema = typeof leaseEndFormSchema;

export const newLeaseSchema = z.object({
   unitNum: z.string().min(3).max(9),
   organization: z.boolean(),
   discountId: z.string().cuid2().optional(),
   customerId: z.string().cuid2(),
   paymentType: z.enum(['CASH', 'CHECK', 'STRIPE']).optional()
})
export type NewLeaseSchema = typeof newLeaseSchema;

export const paymentRecordSchema = z.object({
   customerId: z.string().cuid2(),
   invoiceId: z.string().nullable(),
   paymentAmount: z.number(),
   payee: z.string().optional(),
   unitNum: z.string().min(3).max(8).nullable(),
   paymentType: z.enum(['STRIPE', 'CASH', 'CHECK']),
   paymentNotes: z.string().optional(),
});
export type PaymentRecordSchema = typeof paymentRecordSchema

export const loginSchema = z.object({
   email: z.string().email().min(3).max(255).trim(),
});
export type LoginSchema = typeof loginSchema;

export const emailFormSchema = z.object({
   email: z.string().min(3).max(255).email().trim().toLowerCase(),
   emailConfirm: z.string().min(3).max(255).email().trim().toLowerCase(),
}).superRefine(({ email, emailConfirm}, context) =>{
   if(email !== emailConfirm) {
      context.addIssue({
         code: 'custom',
         message: 'Emails must match', 
         path: ['email']
      })
      context.addIssue({
         code: 'custom',
         message: 'Emails must match', 
         path: ['emailConfirm']
      })
   }
});
export type EmailFormSchema = typeof emailFormSchema;

export const addressFormSchema = z.object({
   organizationName: z.string().min(1).max(255).trim().optional(),
   address1: z.string().min(2).max(255).trim(),
   address2: z.string().min(2).max(255).trim().optional(),
   city: z.string(),
   state: z.string().min(2).max(255),
   postalCode: z.string().min(5).max(9),
   country: z.string().min(2).max(2),
   phoneNum1: z.string().min(10).max(12).trim(),
   phoneNum1Country: z.string().min(2).max(2).trim(),
});

export type AddressFormSchema = typeof addressFormSchema;

export const nameFormSchema = z.object({
   familyName: z.string().min(1).max(255).trim(),
   givenName: z.string().min(1).max(255).trim(),
   organizationName: z.string().min(1).max(255).nullable(),
});
export type NameFormSchema = typeof nameFormSchema;

export const registerFormSchema = z.object({
   familyName: z.string().min(1).max(255).trim(),
   givenName: z.string().min(1).max(255).trim(),
   organizationName: z.string().min(1).max(255).trim().optional(),
   email: z.string().min(5).max(255),
   emailConfirm: z.string().min(5).max(255),
}).superRefine(({email, emailConfirm}, context)=>{
   if(emailConfirm !== email){
      context.addIssue({
         code: 'custom',
         message: 'Email must match email confirm', 
         path: ['email']
      })
      context.addIssue({
         code: 'custom',
         message: 'Email must match email confirm', 
         path: ['emailConfirm']
      })
   }
});
export type RegisterFormSchema = typeof registerFormSchema;

export const emailVerificationFormSchema = z.object({
   code: z.string().min(8).max(8)
});
export type EmailVerificationFormSchema = typeof emailVerificationFormSchema;

export const searchFormSchema = z.object({
   search: z.string().min(1).max(255),
});
export type SearchFormSchema = typeof searchFormSchema;

export const leaseDiscountFormSchema = z.object({
   code: z.string().min(8).max(255).nullable(),
   unitNum: z.string().min(3).max(8),
});
export type LeaseDiscountFormSchema = typeof leaseDiscountFormSchema;

export const newDiscountFormSchema = z.object({
   code: z.string().min(8).max(255),
   amountOff: z.number().min(0),
   percentage: z.boolean(),
   notes: z.string().nullable()
});
export type NewDiscountFormSchema = typeof newDiscountFormSchema;

export const cuidIdFormSchema = z.object({
   cuid2Id: z.string().cuid2()
});
export type CuidIdFormSchema = typeof cuidIdFormSchema;

export const newInvoiceFormSchema = z.object({
   customerId: z.string().cuid2(),
   invoiceNotes: z.string().nullable(),
   employeeId: z.string().min(23).max(30),
   invoiceAmount: z.number().positive(),
   leaseId: z.string().min(23).max(30).nullable(),
   deposit: z.boolean()
})
export type NewInvoiceFormSchema = typeof newInvoiceFormSchema;

export const magicLinkFormSchema = z.object({
   email: z.string().min(5)
});
export type MagicLinkFormSchema  = typeof magicLinkFormSchema;

export const newPaymentRecordFormSchema = z.object({
   customerId: z.string().cuid2(),
   employeeId: z.string().cuid2(),
   invoiceNum: z.number().nullable(),
   paymentAmount: z.number().positive(),
   payee: z.string().nullable().optional(),
   paymentCompleted: z.boolean(),
   paymentNotes: z.string().nullable(),
   paymentType: z.enum(['CASH', 'CHECK', 'STRIPE']),
   cashOrCheck: z.boolean(),
   deposit: z.boolean() 
})
export type NewPaymentRecordFormSchema = typeof newPaymentRecordFormSchema;

export const paymentRecordDeleteSchema = z.object({
   paymentRecordNumber: z.number().positive()
});
export type PaymentRecordDeleteSchema = typeof paymentRecordDeleteSchema;

export const refundFormSchema = z.object({
   paymentRecordNumber: z.number().positive(),
   amount: z.number().positive(),
   notes: z.string().nullable(),
   refundType: z.enum(['CASH', 'CHECK', 'STRIPE']), 
})
export type RefundFormSchema = typeof refundFormSchema;

export const dateSearchFormSchema = z.object({
   startDate: z.date().optional(),
   endDate: z.date().optional()
});
export type DateSearchFormSchema = typeof dateSearchFormSchema;

export const blankFormSchema = z.object({});
export type BlankFormSchema = typeof blankFormSchema

export const creditCardFormSchema = v.object({
   ccNum: v.pipe(v.string(), v.creditCard()),
   cvv: v.pipe(v.string(), v.digits(), v.minLength(3), v.maxLength(4)),
   expMonth: v.pipe(v.number(), v.integer(), v.maxValue(12), v.minValue(1)),
   expYear: v.pipe(v.number(), v.integer(), v.minValue(2025), v.maxValue(3045)),
   postalCode: v.pipe(v.string(), v.digits(), v.minLength(5), v.maxLength(5)),
})
export type CreditCardFormSchema = typeof creditCardFormSchema
// export const creditCardFormSchema = z.object({
//    ccNum: z.number().positive().int(),
//    cvv: z.number().positive().min(100).max(9999),
//    expMonth: z.string(),
//    expYear: z.string(),
//    postalCode: z.string(),
// })
// export type CreditCardFormSchema = typeof creditCardFormSchema;