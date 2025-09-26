-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."PaymentType" AS ENUM('CREDIT', 'CASH', 'CHECK');--> statement-breakpoint
CREATE TABLE "Lease" (
	"leaseId" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"employeeId" text NOT NULL,
	"addressId" text NOT NULL,
	"unitNum" text NOT NULL,
	"price" double precision NOT NULL,
	"discountedAmount" double precision,
	"discountId" text,
	"leaseCreatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"leaseReturnedAt" timestamp(3),
	"leaseEffectiveDate" timestamp(3) NOT NULL,
	"leaseEnded" timestamp(3),
	"dropboxURL" text,
	"anvilEID" text,
	"subscriptionId" text
);
--> statement-breakpoint
CREATE TABLE "Unit" (
	"num" text PRIMARY KEY NOT NULL,
	"building" text NOT NULL,
	"size" text NOT NULL,
	"description" text NOT NULL,
	"leasedPrice" integer,
	"advertisedPrice" integer NOT NULL,
	"deposit" integer NOT NULL,
	"notes" text,
	"unavailable" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discountCode" (
	"discountId" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"amountOff" double precision NOT NULL,
	"percentage" boolean DEFAULT false NOT NULL,
	"notes" text,
	"discountCreated" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"discountEnded" timestamp(3),
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentRecord" (
	"paymentNumber" serial PRIMARY KEY NOT NULL,
	"transactionId" text,
	"invoiceNum" integer,
	"customerId" text NOT NULL,
	"unitNum" text,
	"paymentAmount" double precision NOT NULL,
	"employeeId" text,
	"payee" text,
	"paymentCreated" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"paymentCompleted" timestamp(3),
	"paymentNotes" text,
	"deposit" boolean DEFAULT false NOT NULL,
	"paymentType" "PaymentType" NOT NULL,
	"invoiceInvoiceNum" integer,
	"refundedAmount" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "RefundRecord" (
	"refundNumber" serial PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"refundAmount" double precision NOT NULL,
	"employeeId" text,
	"refundNotes" text,
	"refundCreated" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"refundCompleted" timestamp(3),
	"paymentRecordNum" integer NOT NULL,
	"deposit" boolean DEFAULT false NOT NULL,
	"refundType" "PaymentType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3),
	"email" text,
	"givenName" text,
	"familyName" text,
	"organizationName" text,
	"email_verified" boolean,
	"employee" boolean DEFAULT false NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"archive" boolean DEFAULT false NOT NULL,
	"googleId" text,
	"yahooId" text,
	"customerNotes" text,
	"doNotRent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MagicLink" (
	"token_hash" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "address" (
	"addressId" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"address1" text NOT NULL,
	"address2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postalCode" text NOT NULL,
	"country" text NOT NULL,
	"phoneNum1" text NOT NULL,
	"phoneNum1Country" text NOT NULL,
	"phoneNum1Validated" boolean DEFAULT false NOT NULL,
	"softDelete" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"invoiceNum" serial PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"employeeId" text,
	"leaseId" text,
	"invoiceCreated" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"invoiceNotes" text,
	"deposit" boolean DEFAULT false NOT NULL,
	"amount_paid" double precision DEFAULT 0 NOT NULL,
	"invoice_amount" double precision NOT NULL,
	"invoice_due" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_PaymentRecordToRefundRecord" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_PaymentRecordToRefundRecord_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."address"("addressId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitNum_fkey" FOREIGN KEY ("unitNum") REFERENCES "public"."Unit"("num") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."discountCode"("discountId") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "discountCode" ADD CONSTRAINT "discountCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_invoiceInvoiceNum_fkey" FOREIGN KEY ("invoiceInvoiceNum") REFERENCES "public"."invoice"("invoiceNum") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_email_fkey" FOREIGN KEY ("user_id","email") REFERENCES "public"."users"("email","id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "public"."Lease"("leaseId") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_PaymentRecordToRefundRecord" ADD CONSTRAINT "_PaymentRecordToRefundRecord_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."PaymentRecord"("paymentNumber") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_PaymentRecordToRefundRecord" ADD CONSTRAINT "_PaymentRecordToRefundRecord_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."RefundRecord"("refundNumber") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Lease_anvilEID_key" ON "Lease" USING btree ("anvilEID" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Lease_leaseId_key" ON "Lease" USING btree ("leaseId" text_ops);--> statement-breakpoint
CREATE INDEX "Lease_leaseId_leaseCreatedAt_idx" ON "Lease" USING btree ("leaseId" text_ops,"leaseCreatedAt" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Lease_leaseId_unitNum_price_key" ON "Lease" USING btree ("leaseId" float8_ops,"unitNum" float8_ops,"price" text_ops);--> statement-breakpoint
CREATE INDEX "Unit_num_idx" ON "Unit" USING btree ("num" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Unit_num_key" ON "Unit" USING btree ("num" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "discountCode_code_key" ON "discountCode" USING btree ("code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "discountCode_discountId_amountOff_key" ON "discountCode" USING btree ("discountId" float8_ops,"amountOff" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "discountCode_discountId_key" ON "discountCode" USING btree ("discountId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentRecord_paymentNumber_key" ON "PaymentRecord" USING btree ("paymentNumber" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentRecord_transactionId_key" ON "PaymentRecord" USING btree ("transactionId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "RefundRecord_refundNumber_key" ON "RefundRecord" USING btree ("refundNumber" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_givenName_familyName_key" ON "users" USING btree ("email" text_ops,"givenName" text_ops,"familyName" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "users_id_email_idx" ON "users" USING btree ("id" text_ops,"email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_id_key" ON "users" USING btree ("id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "MagicLink_token_hash_key" ON "MagicLink" USING btree ("token_hash" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "address_addressId_key" ON "address" USING btree ("addressId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_invoiceNum_key" ON "invoice" USING btree ("invoiceNum" int4_ops);--> statement-breakpoint
CREATE INDEX "_PaymentRecordToRefundRecord_B_index" ON "_PaymentRecordToRefundRecord" USING btree ("B" int4_ops);
*/