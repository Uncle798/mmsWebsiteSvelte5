import { relations, sql } from 'drizzle-orm'
import { boolean, doublePrecision, foreignKey, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const PaymentType = pgEnum('PaymentType', ['CREDIT', 'CASH', 'CHECK'])

export const User = pgTable('users', {
	id: text('id').notNull().primaryKey().default(sql`cuid(2)`),
	createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { precision: 3 }),
	email: text('email').unique(),
	givenName: text('givenName'),
	familyName: text('familyName'),
	organizationName: text('organizationName'),
	emailVerified: boolean('email_verified'),
	employee: boolean('employee').notNull(),
	admin: boolean('admin').notNull(),
	archive: boolean('archive').notNull(),
	googleId: text('googleId'),
	yahooId: text('yahooId'),
	customerNotes: text('customerNotes'),
	doNotRent: boolean('doNotRent').notNull()
}, (User) => ({
	'User_id_email_unique_idx': uniqueIndex('User_id_email_key')
		.on(User.id, User.email),
	'User_email_givenName_familyName_unique_idx': uniqueIndex('User_email_givenName_familyName_key')
		.on(User.email, User.givenName, User.familyName)
}));

export const Address = pgTable('address', {
	addressId: text('addressId').notNull().primaryKey().default(sql`cuid(2)`),
	userId: text('userId').notNull(),
	address1: text('address1').notNull(),
	address2: text('address2'),
	city: text('city').notNull(),
	state: text('state').notNull(),
	postalCode: text('postalCode').notNull(),
	country: text('country').notNull(),
	phoneNum1: text('phoneNum1').notNull(),
	phoneNum1Country: text('phoneNum1Country').notNull(),
	phoneNum1Validated: boolean('phoneNum1Validated').notNull(),
	softDelete: boolean('softDelete').notNull()
}, (Address) => ({
	'address_user_fkey': foreignKey({
		name: 'address_user_fkey',
		columns: [Address.userId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const Unit = pgTable('Unit', {
	num: text('num').notNull().primaryKey(),
	building: text('building').notNull(),
	size: text('size').notNull(),
	description: text('description').notNull(),
	leasedPrice: integer('leasedPrice'),
	advertisedPrice: integer('advertisedPrice').notNull(),
	deposit: integer('deposit').notNull(),
	notes: text('notes'),
	unavailable: boolean('unavailable').notNull()
});

export const Lease = pgTable('Lease', {
	leaseId: text('leaseId').notNull().primaryKey().default(sql`cuid(2)`),
	customerId: text('customerId').notNull(),
	employeeId: text('employeeId').notNull(),
	addressId: text('addressId').notNull(),
	unitNum: text('unitNum').notNull(),
	price: doublePrecision('price').notNull(),
	discountedAmount: doublePrecision('discountedAmount'),
	discountId: text('discountId'),
	leaseCreatedAt: timestamp('leaseCreatedAt', { precision: 3 }).notNull().defaultNow(),
	leaseReturnedAt: timestamp('leaseReturnedAt', { precision: 3 }),
	leaseEffectiveDate: timestamp('leaseEffectiveDate', { precision: 3 }).notNull(),
	leaseEnded: timestamp('leaseEnded', { precision: 3 }),
	dropboxURL: text('dropboxURL'),
	anvilEID: text('anvilEID').unique(),
	subscriptionId: text('subscriptionId')
}, (Lease) => ({
	'Lease_Address_fkey': foreignKey({
		name: 'Lease_Address_fkey',
		columns: [Lease.addressId],
		foreignColumns: [Address.addressId]
	})
		.onUpdate('cascade'),
	'Lease_customer_fkey': foreignKey({
		name: 'Lease_customer_fkey',
		columns: [Lease.customerId],
		foreignColumns: [User.id]
	})
		.onUpdate('cascade'),
	'Lease_employee_fkey': foreignKey({
		name: 'Lease_employee_fkey',
		columns: [Lease.employeeId],
		foreignColumns: [User.id]
	})
		.onUpdate('cascade'),
	'Lease_unit_fkey': foreignKey({
		name: 'Lease_unit_fkey',
		columns: [Lease.unitNum],
		foreignColumns: [Unit.num]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'Lease_discountCode_fkey': foreignKey({
		name: 'Lease_discountCode_fkey',
		columns: [Lease.discountId],
		foreignColumns: [DiscountCode.discountId]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'Lease_leaseId_unitNum_price_unique_idx': uniqueIndex('Lease_leaseId_unitNum_price_key')
		.on(Lease.leaseId, Lease.unitNum, Lease.price)
}));

export const Invoice = pgTable('invoice', {
	invoiceNum: serial('invoiceNum').notNull().primaryKey(),
	customerId: text('customerId').notNull(),
	employeeId: text('employeeId'),
	leaseId: text('leaseId'),
	invoiceAmount: doublePrecision('invoice_amount').notNull(),
	invoiceCreated: timestamp('invoiceCreated', { precision: 3 }).notNull().defaultNow(),
	invoiceDue: timestamp('invoice_due', { precision: 3 }).notNull(),
	invoiceNotes: text('invoiceNotes'),
	deposit: boolean('deposit').notNull(),
	amountPaid: doublePrecision('amount_paid').notNull()
}, (Invoice) => ({
	'invoice_customer_fkey': foreignKey({
		name: 'invoice_customer_fkey',
		columns: [Invoice.customerId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'invoice_employee_fkey': foreignKey({
		name: 'invoice_employee_fkey',
		columns: [Invoice.employeeId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'invoice_lease_fkey': foreignKey({
		name: 'invoice_lease_fkey',
		columns: [Invoice.leaseId],
		foreignColumns: [Lease.leaseId]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const PaymentRecord = pgTable('PaymentRecord', {
	paymentNumber: serial('paymentNumber').notNull().primaryKey(),
	transactionId: text('transactionId').unique(),
	invoiceNum: integer('invoiceNum'),
	customerId: text('customerId').notNull(),
	unitNum: text('unitNum'),
	paymentAmount: doublePrecision('paymentAmount').notNull(),
	employeeId: text('employeeId'),
	payee: text('payee'),
	paymentCreated: timestamp('paymentCreated', { precision: 3 }).notNull().defaultNow(),
	paymentCompleted: timestamp('paymentCompleted', { precision: 3 }),
	paymentNotes: text('paymentNotes'),
	deposit: boolean('deposit').notNull(),
	refundedAmount: doublePrecision('refundedAmount').notNull(),
	paymentType: PaymentType('paymentType').notNull(),
	invoiceInvoiceNum: integer('invoiceInvoiceNum')
}, (PaymentRecord) => ({
	'PaymentRecord_invoice_fkey': foreignKey({
		name: 'PaymentRecord_invoice_fkey',
		columns: [PaymentRecord.invoiceInvoiceNum],
		foreignColumns: [Invoice.invoiceNum]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'PaymentRecord_customer_fkey': foreignKey({
		name: 'PaymentRecord_customer_fkey',
		columns: [PaymentRecord.customerId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'PaymentRecord_receiver_fkey': foreignKey({
		name: 'PaymentRecord_receiver_fkey',
		columns: [PaymentRecord.employeeId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const RefundRecord = pgTable('RefundRecord', {
	refundNumber: serial('refundNumber').notNull().primaryKey(),
	customerId: text('customerId').notNull(),
	refundAmount: doublePrecision('refundAmount').notNull(),
	employeeId: text('employeeId'),
	refundNotes: text('refundNotes'),
	refundCreated: timestamp('refundCreated', { precision: 3 }).notNull().defaultNow(),
	refundCompleted: timestamp('refundCompleted', { precision: 3 }),
	paymentRecordNum: integer('paymentRecordNum').notNull(),
	deposit: boolean('deposit').notNull(),
	refundType: PaymentType('refundType').notNull()
}, (RefundRecord) => ({
	'RefundRecord_customer_fkey': foreignKey({
		name: 'RefundRecord_customer_fkey',
		columns: [RefundRecord.customerId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'RefundRecord_employee_fkey': foreignKey({
		name: 'RefundRecord_employee_fkey',
		columns: [RefundRecord.employeeId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const DiscountCode = pgTable('discountCode', {
	discountId: text('discountId').notNull().primaryKey().default(sql`cuid(2)`),
	code: text('code').notNull().unique(),
	amountOff: doublePrecision('amountOff').notNull(),
	percentage: boolean('percentage').notNull(),
	notes: text('notes'),
	discountCreated: timestamp('discountCreated', { precision: 3 }).notNull().defaultNow(),
	discountEnded: timestamp('discountEnded', { precision: 3 }),
	userId: text('userId').notNull()
}, (DiscountCode) => ({
	'discountCode_employee_fkey': foreignKey({
		name: 'discountCode_employee_fkey',
		columns: [DiscountCode.userId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'DiscountCode_discountId_amountOff_unique_idx': uniqueIndex('DiscountCode_discountId_amountOff_key')
		.on(DiscountCode.discountId, DiscountCode.amountOff)
}));

export const Session = pgTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('userId').notNull(),
	expiresAt: timestamp('expiresAt', { precision: 3 }).notNull()
}, (Session) => ({
	'session_user_fkey': foreignKey({
		name: 'session_user_fkey',
		columns: [Session.userId],
		foreignColumns: [User.id]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const Verification = pgTable('verification', {
	id: text('id').notNull().primaryKey().default(sql`cuid(2)`),
	code: text('code').notNull(),
	userId: text('user_id').notNull(),
	email: text('email').notNull(),
	expiresAt: timestamp('expires_at', { precision: 3 }).notNull()
}, (Verification) => ({
	'verification_user_fkey': foreignKey({
		name: 'verification_user_fkey',
		columns: [Verification.userId, Verification.email],
		foreignColumns: [User.id, User.email]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const MagicLink = pgTable('MagicLink', {
	tokenHash: text('token_hash').notNull().unique(),
	email: text('email').notNull(),
	expiresAt: timestamp('expires_at', { precision: 3 }).notNull()
});

export const PaymentRecordToRefundRecord = pgTable('_PaymentRecordToRefundRecord', {
	RefundRecordId: integer('A').notNull(),
	PaymentRecordId: integer('B').notNull()
}, (PaymentRecordToRefundRecord) => ({
	'_PaymentRecordToRefundRecord_RefundRecord_fkey': foreignKey({
		name: '_PaymentRecordToRefundRecord_RefundRecord_fkey',
		columns: [PaymentRecordToRefundRecord.RefundRecordId],
		foreignColumns: [RefundRecord.refundNumber]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'_PaymentRecordToRefundRecord_PaymentRecord_fkey': foreignKey({
		name: '_PaymentRecordToRefundRecord_PaymentRecord_fkey',
		columns: [PaymentRecordToRefundRecord.PaymentRecordId],
		foreignColumns: [PaymentRecord.paymentNumber]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const UserRelations = relations(User, ({ many }) => ({
	address: many(Address, {
		relationName: 'AddressToUser'
	}),
	customerInvoices: many(Invoice, {
		relationName: 'customer'
	}),
	employeeInvoices: many(Invoice, {
		relationName: 'employee'
	}),
	customerLeases: many(Lease, {
		relationName: 'customer'
	}),
	employeeLeases: many(Lease, {
		relationName: 'employee'
	}),
	paymentMade: many(PaymentRecord, {
		relationName: 'customer'
	}),
	paymentReceived: many(PaymentRecord, {
		relationName: 'employee'
	}),
	refundReceived: many(RefundRecord, {
		relationName: 'customer'
	}),
	refundMade: many(RefundRecord, {
		relationName: 'employee'
	}),
	session: many(Session, {
		relationName: 'SessionToUser'
	}),
	verification: many(Verification, {
		relationName: 'UserToVerification'
	}),
	employeeDiscountCode: many(DiscountCode, {
		relationName: 'DiscountCodeToUser'
	})
}));

export const AddressRelations = relations(Address, ({ one, many }) => ({
	user: one(User, {
		relationName: 'AddressToUser',
		fields: [Address.userId],
		references: [User.id]
	}),
	leases: many(Lease, {
		relationName: 'AddressToLease'
	})
}));

export const UnitRelations = relations(Unit, ({ many }) => ({
	lease: many(Lease, {
		relationName: 'LeaseToUnit'
	})
}));

export const LeaseRelations = relations(Lease, ({ many, one }) => ({
	invoices: many(Invoice, {
		relationName: 'InvoiceToLease'
	}),
	Address: one(Address, {
		relationName: 'AddressToLease',
		fields: [Lease.addressId],
		references: [Address.addressId]
	}),
	customer: one(User, {
		relationName: 'customer',
		fields: [Lease.customerId],
		references: [User.id]
	}),
	employee: one(User, {
		relationName: 'employee',
		fields: [Lease.employeeId],
		references: [User.id]
	}),
	unit: one(Unit, {
		relationName: 'LeaseToUnit',
		fields: [Lease.unitNum],
		references: [Unit.num]
	}),
	discountCode: one(DiscountCode, {
		relationName: 'DiscountCodeToLease',
		fields: [Lease.discountId],
		references: [DiscountCode.discountId]
	})
}));

export const InvoiceRelations = relations(Invoice, ({ one, many }) => ({
	customer: one(User, {
		relationName: 'customer',
		fields: [Invoice.customerId],
		references: [User.id]
	}),
	employee: one(User, {
		relationName: 'employee',
		fields: [Invoice.employeeId],
		references: [User.id]
	}),
	lease: one(Lease, {
		relationName: 'InvoiceToLease',
		fields: [Invoice.leaseId],
		references: [Lease.leaseId]
	}),
	paymentRecords: many(PaymentRecord, {
		relationName: 'InvoiceToPaymentRecord'
	})
}));

export const PaymentRecordRelations = relations(PaymentRecord, ({ one, many }) => ({
	invoice: one(Invoice, {
		relationName: 'InvoiceToPaymentRecord',
		fields: [PaymentRecord.invoiceInvoiceNum],
		references: [Invoice.invoiceNum]
	}),
	customer: one(User, {
		relationName: 'customer',
		fields: [PaymentRecord.customerId],
		references: [User.id]
	}),
	receiver: one(User, {
		relationName: 'employee',
		fields: [PaymentRecord.employeeId],
		references: [User.id]
	}),
	refundRecords: many(PaymentRecordToRefundRecord, {
		relationName: 'PaymentRecordToPaymentRecordToRefundRecord'
	})
}));

export const RefundRecordRelations = relations(RefundRecord, ({ many, one }) => ({
	paymentRecord: many(PaymentRecordToRefundRecord, {
		relationName: 'RefundRecordToPaymentRecordToRefundRecord'
	}),
	customer: one(User, {
		relationName: 'customer',
		fields: [RefundRecord.customerId],
		references: [User.id]
	}),
	employee: one(User, {
		relationName: 'employee',
		fields: [RefundRecord.employeeId],
		references: [User.id]
	})
}));

export const DiscountCodeRelations = relations(DiscountCode, ({ one, many }) => ({
	employee: one(User, {
		relationName: 'DiscountCodeToUser',
		fields: [DiscountCode.userId],
		references: [User.id]
	}),
	leases: many(Lease, {
		relationName: 'DiscountCodeToLease'
	})
}));

export const SessionRelations = relations(Session, ({ one }) => ({
	user: one(User, {
		relationName: 'SessionToUser',
		fields: [Session.userId],
		references: [User.id]
	})
}));

export const VerificationRelations = relations(Verification, ({ one }) => ({
	user: one(User, {
		relationName: 'UserToVerification',
		fields: [Verification.userId, Verification.email],
		references: [User.id, User.email]
	})
}));

export const PaymentRecordToRefundRecordRelations = relations(PaymentRecordToRefundRecord, ({ one }) => ({
	RefundRecord: one(RefundRecord, {
		relationName: 'RefundRecordToPaymentRecordToRefundRecord',
		fields: [PaymentRecordToRefundRecord.RefundRecordId],
		references: [RefundRecord.refundNumber]
	}),
	PaymentRecord: one(PaymentRecord, {
		relationName: 'PaymentRecordToPaymentRecordToRefundRecord',
		fields: [PaymentRecordToRefundRecord.PaymentRecordId],
		references: [PaymentRecord.paymentNumber]
	})
}));