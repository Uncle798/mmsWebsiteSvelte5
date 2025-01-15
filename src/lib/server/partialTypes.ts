import { Prisma } from "@prisma/client/edge"

export const partialUser = Prisma.validator<Prisma.UserDefaultArgs>()({
   select:{
      email: true,
      givenName: true,
      familyName: true, 
      organizationName: true,
      id: true,
      employee: true,
      admin: true,
      emailVerified: true,
      stripeId: true,
   }
})
export type PartialUser = Prisma.UserGetPayload<typeof partialUser>

export const partialAddress = Prisma.validator<Prisma.AddressDefaultArgs>()({
   select: {
      address1: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      phoneNum1: true, 
      phoneNum1Country: true,
      userId: true,
   }
})
export type PartialAddress = Prisma.AddressGetPayload<typeof partialAddress>

export const partialLease = Prisma.validator<Prisma.LeaseDefaultArgs>()({
   select: {
      customerId: true,
      employeeId: true,
      addressId: true,
      unitNum: true,
      price: true,
      leaseEffectiveDate: true,
      leaseReturnedAt: true, 
      leaseEnded: true
   }
})
export type PartialLease = Prisma.LeaseGetPayload<typeof partialLease>

export const partialInvoice = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
   select: {
      customerId: true,
      leaseId: true,
      invoiceAmount: true,
      invoiceCreated: true,
      invoiceNotes: true,
      deposit: true
   }
})
export type PartialInvoice = Prisma.InvoiceGetPayload<typeof partialInvoice>

export const partialPaymentRecord = Prisma.validator<Prisma.PaymentRecordDefaultArgs>()({
   select: {
      paymentType: true,
      customerId: true,
      paymentAmount: true,
      employeeId: true,
      paymentCreated: true,
      paymentCompleted: true,
      paymentNotes: true,
      invoiceNum: true,
      deposit: true,
   }
})
export type PartialPaymentRecord = Prisma.PaymentRecordGetPayload<typeof partialPaymentRecord>

export const partialUnit = Prisma.validator<Prisma.UnitDefaultArgs>()({
   select: {
      num: true,
      size: true,
      building: true,
   }
})
export type PartialUnit = Prisma.UnitGetPayload<typeof partialUnit>

export const partialDiscount = Prisma.validator<Prisma.DiscountCodeDefaultArgs>()({
   select: {
      code: true,
      notes: true,
      userId: true,
      amountOff: true,
   }
})
export type PartialDiscount = Prisma.DiscountCodeGetPayload<typeof partialDiscount>