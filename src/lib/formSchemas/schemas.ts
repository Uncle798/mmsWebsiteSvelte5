
import * as v from 'valibot'
import { PaymentType } from "@prisma/client";

export const employmentFormSchema = v.object({
   employee: v.nullable(v.boolean()),
   admin: v.nullable(v.boolean()),
   userId: v.pipe(v.string(), v.cuid2()),
});
export type EmploymentFormSchema = typeof employmentFormSchema;

export const unitPricingFormSchema = v.object({
   size: v.pipe(v.string(), v.minLength(5), v.maxLength(8)),
   price: v.pipe(v.number(), v.integer(), v.minValue(1)),
   changeDeposit: v.boolean(),
   lowerPrice: v.boolean(),
});
export type UnitPricingFormSchema = typeof unitPricingFormSchema;

export const unitNotesFormSchema =  v.object({
   notes: v.nullable(v.string()),
   unavailable: v.boolean(),
   unitNum: v.pipe(v.string(), v.maxLength(7), v.minLength(3)),
});
export type  UnitNotesFormSchema = typeof unitNotesFormSchema;

export const leaseEndFormSchema = v.object({
   leaseId: v.pipe(v.string(), v.cuid2()),
   customer: v.nullable(v.boolean()),
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

export const loginSchema = v.object({
   email: v.pipe(v.string(), v.email()),
});
export type LoginSchema = typeof loginSchema;

export const emailFormSchema = v.pipe(
   v.object({
      email: v.pipe(v.string(), v.email()),
      confirmEmail: v.pipe(v.string(), v.email()),
   }),
   v.rawCheck(({dataset, addIssue}) =>{
      if(dataset.typed){
         if(dataset.value.email !== dataset.value.confirmEmail){
            addIssue({
               message: 'Emails must match',
               path: [{
                  type: 'object',
                  origin: 'value',
                  input: dataset.value,
                  key: 'email',
                  value: dataset.value.email
               }]
            })
         }
      }
   })
)
export type EmailFormSchema = typeof emailFormSchema;

export const addressFormSchema = v.object({
   organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
   address1: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
   address2: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(255))),
   city: v.string(),
   state: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
   postalCode: v.pipe(v.string(), v.minLength(5), v.maxLength(9)),
   country: v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
   phoneNum1: v.pipe(v.string(), v.minLength(10), v.maxLength(12), v.digits()),
   phoneNum1Country: v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
});
export type AddressFormSchema = typeof addressFormSchema;

export const nameFormSchema = v.object({
   familyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
   givenName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
   organizationName: v.nullable(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
});
export type NameFormSchema = typeof nameFormSchema;

export const registerFormSchema = v.pipe(
   v.object({
      familyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      givenName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      organizationName: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
      email: v.pipe(v.string(), v.email()),
      emailConfirm: v.pipe(v.string(), v.email())
   }),
   v.rawCheck(({dataset, addIssue}) => {
      if(dataset.typed){
         if(dataset.value.email !== dataset.value.emailConfirm){
            addIssue({
               message: 'Emails must match',
               path: [{
                  type: 'object',
                  origin: 'value',
                  input: dataset.value,
                  key: 'email', 
                  value: dataset.value.email
               }]
            })
         }
      }
   })
)
export type RegisterFormSchema = typeof registerFormSchema;

export const emailVerificationFormSchema = v.object({
   code: v.pipe(v.string(), v.minLength(8), v.maxLength(8))
});
export type EmailVerificationFormSchema = typeof emailVerificationFormSchema;

export const searchFormSchema = v.object({
   search: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
});
export type SearchFormSchema = typeof searchFormSchema;

export const leaseDiscountFormSchema = v.object({
   code: v.nullable(v.pipe(v.string(), v.minLength(8), v.maxLength(255))),
   unitNum: v.pipe(v.string(), v.minLength(3), v.maxLength(8)),
});
export type LeaseDiscountFormSchema = typeof leaseDiscountFormSchema;

export const newDiscountFormSchema = v.object({
   code: v.pipe(v.string(), v.minLength(8), v.maxLength(255)),
   amountOff: v.pipe(v.number(), v.minValue(1)),
   percentage: v.boolean(),
   notes: v.nullable(v.string())
});
export type NewDiscountFormSchema = typeof newDiscountFormSchema;

export const cuidIdFormSchema = v.object({
   cuid2Id: v.pipe(v.string(), v.cuid2())
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

export const magicLinkFormSchema = v.object({
   email: v.pipe(v.string(), v.minLength(5))
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

export const paymentRecordDeleteSchema = v.object({
   paymentRecordNumber: v.pipe(v.number(), v.minValue(1))
});
export type PaymentRecordDeleteSchema = typeof paymentRecordDeleteSchema;

export const refundFormSchema = v.object({
   paymentRecordNumber: v.pipe(v.number(), v.minValue(1)),
   amount: v.pipe(v.number(), v.minValue(1)),
   notes: v.optional(v.string()),
   refundType: v.enum(PaymentType)
})
export type RefundFormSchema = typeof refundFormSchema;

export const dateSearchFormSchema = v.object({
   startDate: v.optional(v.date()),
   endDate: v.optional(v.date())
});
export type DateSearchFormSchema = typeof dateSearchFormSchema;

export const blankFormSchema = v.object({});
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
