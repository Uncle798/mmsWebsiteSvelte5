import { z } from "zod"
import * as v from 'valibot'
import { PaymentType } from "@prisma/client";

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

export const unitNotesFormSchema =  v.object({
   notes: v.nullable(v.string()),
   unavailable: v.boolean(),
   unitNum: v.pipe(v.string(), v.maxLength(7), v.minLength(3)),
});
export type  UnitNotesFormSchema = typeof unitNotesFormSchema;

export const leaseEndFormSchema = z.object({
   leaseId: z.string().cuid2(),
   customer: z.boolean().nullable(),
})
export type LeaseEndFormSchema = typeof leaseEndFormSchema;

export const newLeaseSchema = v.object({
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   organization: v.boolean(),
   discountId: v.optional(v.pipe(v.string(), v.cuid2())),
   customerId: v.pipe(v.string(), v.cuid2()),
   paymentType: v.optional(v.enum(PaymentType)),
})
export type NewLeaseSchema = typeof newLeaseSchema;

export const paymentRecordSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   invoiceId: v.optional(v.pipe(v.string(), v.cuid2())),
   paymentAmount: v.pipe(v.number(), v.integer(), v.minValue(1)),
   payee: v.optional(v.string()),
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(9)),
   paymentType: v.enum(PaymentType),
   paymentNote: v.optional(v.string())
})
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

export const newInvoiceFormSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   employeeId: v.pipe(v.string(), v.cuid2()),
   invoiceNotes: v.string(),
   invoiceAmount: v.pipe(v.number(), v.gtValue(1)),
   leaseId: v.pipe(v.string(), v.cuid2()),
   deposit: v.boolean(),
   invoiceDue: v.date(),
})
export type NewInvoiceFormSchema = typeof newInvoiceFormSchema

export const magicLinkFormSchema = z.object({
   email: z.string().min(5)
});
export type MagicLinkFormSchema  = typeof magicLinkFormSchema;

export const newPaymentRecordFormSchema = v.object({
   customerId: v.pipe(v.string(), v.cuid2()),
   employeeId: v.pipe(v.string(), v.cuid2()),
   invoiceNum: v.nullable(v.pipe(v.number(), v.minValue(1))),
   paymentAmount: v.pipe(v.number(), v.minValue(1)),
   payee: v.optional(v.string()),
   paymentCompleted: v.boolean(),
   paymentNotes: v.optional(v.string()),
   paymentType: v.enum(PaymentType),
   cashOrCheck: v.boolean(),
   deposit: v.boolean(),
})
export type NewPaymentRecordFormSchema = typeof newPaymentRecordFormSchema;

export const paymentRecordDeleteSchema = z.object({
   paymentRecordNumber: z.number().positive()
});
export type PaymentRecordDeleteSchema = typeof paymentRecordDeleteSchema;

export const refundFormSchema = v.object({
   paymentRecordNumber: v.pipe(v.number(), v.minValue(1)),
   amount: v.pipe(v.number(), v.minValue(1)),
   notes: v.optional(v.string()),
   refundType: v.enum(PaymentType)
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
   exp: v.pipe(v.string()),
   postalCode: v.pipe(v.string(), v.digits(), v.minLength(5), v.maxLength(5)),
   billingGivenName: v.string(),
   billingFamilyName: v.string(),
})
export type CreditCardFormSchema = typeof creditCardFormSchema
