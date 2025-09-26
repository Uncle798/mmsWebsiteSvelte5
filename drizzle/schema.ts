import { pgTable, uniqueIndex, index, foreignKey, text, doublePrecision, timestamp, integer, boolean, serial, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const paymentType = pgEnum("PaymentType", ['CREDIT', 'CASH', 'CHECK'])


export const lease = pgTable("Lease", {
	leaseId: text().primaryKey().notNull(),
	customerId: text().notNull(),
	employeeId: text().notNull(),
	addressId: text().notNull(),
	unitNum: text().notNull(),
	price: doublePrecision().notNull(),
	discountedAmount: doublePrecision(),
	discountId: text(),
	leaseCreatedAt: timestamp({ precision: 3,  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	leaseReturnedAt: timestamp({ precision: 3,  }),
	leaseEffectiveDate: timestamp({ precision: 3,  }).notNull(),
	leaseEnded: timestamp({ precision: 3,  }),
	dropboxUrl: text(),
	anvilEid: text(),
	subscriptionId: text(),
}, (table) => [
	uniqueIndex("Lease_anvilEID_key").using("btree", table.anvilEid.asc().nullsLast().op("text_ops")),
	uniqueIndex("Lease_leaseId_key").using("btree", table.leaseId.asc().nullsLast().op("text_ops")),
	index("Lease_leaseId_leaseCreatedAt_idx").using("btree", table.leaseId.asc().nullsLast().op("text_ops"), table.leaseCreatedAt.desc().nullsFirst().op("timestamp_ops")),
	uniqueIndex("Lease_leaseId_unitNum_price_key").using("btree", table.leaseId.asc().nullsLast().op("float8_ops"), table.unitNum.asc().nullsLast().op("float8_ops"), table.price.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [address.addressId],
			name: "Lease_addressId_fkey"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "Lease_customerId_fkey"
		}),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [users.id],
			name: "Lease_employeeId_fkey"
		}),
	foreignKey({
			columns: [table.unitNum],
			foreignColumns: [unit.num],
			name: "Lease_unitNum_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.discountId],
			foreignColumns: [discountCode.discountId],
			name: "Lease_discountId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const unit = pgTable("Unit", {
	num: text().primaryKey().notNull(),
	building: text().notNull(),
	size: text().notNull(),
	description: text().notNull(),
	leasedPrice: integer(),
	advertisedPrice: integer().notNull(),
	deposit: integer().notNull(),
	notes: text(),
	unavailable: boolean().default(false).notNull(),
}, (table) => [
	index("Unit_num_idx").using("btree", table.num.desc().nullsFirst().op("text_ops")),
	uniqueIndex("Unit_num_key").using("btree", table.num.asc().nullsLast().op("text_ops")),
]);

export const discountCode = pgTable("discountCode", {
	discountId: text().primaryKey().notNull(),
	code: text().notNull(),
	amountOff: doublePrecision().notNull(),
	percentage: boolean().default(false).notNull(),
	notes: text(),
	discountCreated: timestamp({ precision: 3,  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	discountEnded: timestamp({ precision: 3,  }),
	userId: text().notNull(),
}, (table) => [
	uniqueIndex("discountCode_code_key").using("btree", table.code.asc().nullsLast().op("text_ops")),
	uniqueIndex("discountCode_discountId_amountOff_key").using("btree", table.discountId.asc().nullsLast().op("float8_ops"), table.amountOff.asc().nullsLast().op("text_ops")),
	uniqueIndex("discountCode_discountId_key").using("btree", table.discountId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "discountCode_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const paymentRecord = pgTable("PaymentRecord", {
	paymentNumber: serial().primaryKey().notNull(),
	transactionId: text(),
	invoiceNum: integer(),
	customerId: text().notNull(),
	unitNum: text(),
	paymentAmount: doublePrecision().notNull(),
	employeeId: text(),
	payee: text(),
	paymentCreated: timestamp({ precision: 3,  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	paymentCompleted: timestamp({ precision: 3,  }),
	paymentNotes: text(),
	deposit: boolean().default(false).notNull(),
	paymentType: paymentType().notNull(),
	invoiceInvoiceNum: integer(),
	refundedAmount: doublePrecision().default(0).notNull(),
}, (table) => [
	uniqueIndex("PaymentRecord_paymentNumber_key").using("btree", table.paymentNumber.asc().nullsLast().op("int4_ops")),
	uniqueIndex("PaymentRecord_transactionId_key").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "PaymentRecord_customerId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [users.id],
			name: "PaymentRecord_employeeId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.invoiceInvoiceNum],
			foreignColumns: [invoice.invoiceNum],
			name: "PaymentRecord_invoiceInvoiceNum_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const refundRecord = pgTable("RefundRecord", {
	refundNumber: serial().primaryKey().notNull(),
	customerId: text().notNull(),
	refundAmount: doublePrecision().notNull(),
	employeeId: text(),
	refundNotes: text(),
	refundCreated: timestamp({ precision: 3,  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	refundCompleted: timestamp({ precision: 3,  }),
	paymentRecordNum: integer().notNull(),
	deposit: boolean().default(false).notNull(),
	refundType: paymentType().notNull(),
}, (table) => [
	uniqueIndex("RefundRecord_refundNumber_key").using("btree", table.refundNumber.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "RefundRecord_customerId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [users.id],
			name: "RefundRecord_employeeId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { precision: 3,  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3,  }),
	email: text(),
	givenName: text(),
	familyName: text(),
	organizationName: text(),
	emailVerified: boolean("email_verified"),
	employee: boolean().default(false).notNull(),
	admin: boolean().default(false).notNull(),
	archive: boolean().default(false).notNull(),
	googleId: text(),
	yahooId: text(),
	customerNotes: text(),
	doNotRent: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("users_email_givenName_familyName_key").using("btree", table.email.asc().nullsLast().op("text_ops"), table.givenName.asc().nullsLast().op("text_ops"), table.familyName.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_id_email_idx").using("btree", table.id.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
]);

export const magicLink = pgTable("MagicLink", {
	tokenHash: text("token_hash").notNull(),
	email: text().notNull(),
	expiresAt: timestamp("expires_at", { precision: 3,  }).notNull(),
}, (table) => [
	uniqueIndex("MagicLink_token_hash_key").using("btree", table.tokenHash.asc().nullsLast().op("text_ops")),
]);

export const address = pgTable("address", {
	addressId: text().primaryKey().notNull(),
	userId: text().notNull(),
	address1: text().notNull(),
	address2: text(),
	city: text().notNull(),
	state: text().notNull(),
	postalCode: text().notNull(),
	country: text().notNull(),
	phoneNum1: text().notNull(),
	phoneNum1Country: text().notNull(),
	phoneNum1Validated: boolean().default(false).notNull(),
	softDelete: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("address_addressId_key").using("btree", table.addressId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "address_userId_fkey"
		}).onDelete("restrict"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	expiresAt: timestamp({ precision: 3, }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	code: text().notNull(),
	userId: text("user_id").notNull(),
	email: text().notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId, table.email],
			foreignColumns: [users.email, users.id],
			name: "verification_user_id_email_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const invoice = pgTable("invoice", {
	invoiceNum: serial().primaryKey().notNull(),
	customerId: text().notNull(),
	employeeId: text(),
	leaseId: text(),
	invoiceCreated: timestamp({ precision: 3, }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	invoiceNotes: text(),
	deposit: boolean().default(false).notNull(),
	amountPaid: doublePrecision("amount_paid").default(0).notNull(),
	invoiceAmount: doublePrecision("invoice_amount").notNull(),
	invoiceDue: timestamp("invoice_due", { precision: 3, }).notNull(),
}, (table) => [
	uniqueIndex("invoice_invoiceNum_key").using("btree", table.invoiceNum.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "invoice_customerId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [users.id],
			name: "invoice_employeeId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.leaseId],
			foreignColumns: [lease.leaseId],
			name: "invoice_leaseId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const paymentRecordToRefundRecord = pgTable("_PaymentRecordToRefundRecord", {
	a: integer("A").notNull(),
	b: integer("B").notNull(),
}, (table) => [
	index().using("btree", table.b.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [paymentRecord.paymentNumber],
			name: "_PaymentRecordToRefundRecord_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [refundRecord.refundNumber],
			name: "_PaymentRecordToRefundRecord_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.a, table.b], name: "_PaymentRecordToRefundRecord_AB_pkey"}),
]);
