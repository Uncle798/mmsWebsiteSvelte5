import { relations } from "drizzle-orm/relations";
import { address, lease, users, unit, discountCode, paymentRecord, invoice, refundRecord, session, verification, paymentRecordToRefundRecord } from "./schema";

export const leaseRelations = relations(lease, ({one, many}) => ({
	address: one(address, {
		fields: [lease.addressId],
		references: [address.addressId]
	}),
	user_customerId: one(users, {
		fields: [lease.customerId],
		references: [users.id],
		relationName: "lease_customerId_users_id"
	}),
	user_employeeId: one(users, {
		fields: [lease.employeeId],
		references: [users.id],
		relationName: "lease_employeeId_users_id"
	}),
	unit: one(unit, {
		fields: [lease.unitNum],
		references: [unit.num]
	}),
	discountCode: one(discountCode, {
		fields: [lease.discountId],
		references: [discountCode.discountId]
	}),
	invoices: many(invoice),
}));

export const addressRelations = relations(address, ({one, many}) => ({
	leases: many(lease),
	user: one(users, {
		fields: [address.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	leases_customerId: many(lease, {
		relationName: "lease_customerId_users_id"
	}),
	leases_employeeId: many(lease, {
		relationName: "lease_employeeId_users_id"
	}),
	discountCodes: many(discountCode),
	paymentRecords_customerId: many(paymentRecord, {
		relationName: "paymentRecord_customerId_users_id"
	}),
	paymentRecords_employeeId: many(paymentRecord, {
		relationName: "paymentRecord_employeeId_users_id"
	}),
	refundRecords_customerId: many(refundRecord, {
		relationName: "refundRecord_customerId_users_id"
	}),
	refundRecords_employeeId: many(refundRecord, {
		relationName: "refundRecord_employeeId_users_id"
	}),
	addresses: many(address),
	sessions: many(session),
	verifications: many(verification),
	invoices_customerId: many(invoice, {
		relationName: "invoice_customerId_users_id"
	}),
	invoices_employeeId: many(invoice, {
		relationName: "invoice_employeeId_users_id"
	}),
}));

export const unitRelations = relations(unit, ({many}) => ({
	leases: many(lease),
}));

export const discountCodeRelations = relations(discountCode, ({one, many}) => ({
	leases: many(lease),
	user: one(users, {
		fields: [discountCode.userId],
		references: [users.id]
	}),
}));

export const paymentRecordRelations = relations(paymentRecord, ({one, many}) => ({
	user_customerId: one(users, {
		fields: [paymentRecord.customerId],
		references: [users.id],
		relationName: "paymentRecord_customerId_users_id"
	}),
	user_employeeId: one(users, {
		fields: [paymentRecord.employeeId],
		references: [users.id],
		relationName: "paymentRecord_employeeId_users_id"
	}),
	invoice: one(invoice, {
		fields: [paymentRecord.invoiceInvoiceNum],
		references: [invoice.invoiceNum]
	}),
	paymentRecordToRefundRecords: many(paymentRecordToRefundRecord),
}));

export const invoiceRelations = relations(invoice, ({one, many}) => ({
	paymentRecords: many(paymentRecord),
	user_customerId: one(users, {
		fields: [invoice.customerId],
		references: [users.id],
		relationName: "invoice_customerId_users_id"
	}),
	user_employeeId: one(users, {
		fields: [invoice.employeeId],
		references: [users.id],
		relationName: "invoice_employeeId_users_id"
	}),
	lease: one(lease, {
		fields: [invoice.leaseId],
		references: [lease.leaseId]
	}),
}));

export const refundRecordRelations = relations(refundRecord, ({one, many}) => ({
	user_customerId: one(users, {
		fields: [refundRecord.customerId],
		references: [users.id],
		relationName: "refundRecord_customerId_users_id"
	}),
	user_employeeId: one(users, {
		fields: [refundRecord.employeeId],
		references: [users.id],
		relationName: "refundRecord_employeeId_users_id"
	}),
	paymentRecordToRefundRecords: many(paymentRecordToRefundRecord),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));

export const verificationRelations = relations(verification, ({one}) => ({
	user: one(users, {
		fields: [verification.userId],
		references: [users.email]
	}),
}));

export const paymentRecordToRefundRecordRelations = relations(paymentRecordToRefundRecord, ({one}) => ({
	paymentRecord: one(paymentRecord, {
		fields: [paymentRecordToRefundRecord.a],
		references: [paymentRecord.paymentNumber]
	}),
	refundRecord: one(refundRecord, {
		fields: [paymentRecordToRefundRecord.b],
		references: [refundRecord.refundNumber]
	}),
}));