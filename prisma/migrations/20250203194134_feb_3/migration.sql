/*
  Warnings:

  - The primary key for the `Invoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `invoiceId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoicePaid` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRecordId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `unitNum` on the `Invoice` table. All the data in the column will be lost.
  - The primary key for the `PaymentRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `invoiceId` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to drop the column `recordNum` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Unit` table. All the data in the column will be lost.
  - The primary key for the `address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address3` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNum2` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNum2Validated` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invoiceNum]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentRecordNum]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leaseId]` on the table `Lease` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[anvilEID]` on the table `Lease` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentNumber]` on the table `PaymentRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeId]` on the table `PaymentRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[num]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `advertisedPrice` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - The required column `addressId` was added to the `address` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `country` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNum1Country` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_leaseId_unitNum_price_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_paymentRecordId_invoicePaid_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_addressId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentRecord" DROP CONSTRAINT "PaymentRecord_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_user_id_email_fkey";

-- DropIndex
DROP INDEX "Invoice_invoiceId_invoiceCreated_idx";

-- DropIndex
DROP INDEX "Invoice_invoicePaid_key";

-- DropIndex
DROP INDEX "Invoice_paymentRecordId_invoicePaid_key";

-- DropIndex
DROP INDEX "Invoice_paymentRecordId_key";

-- DropIndex
DROP INDEX "PaymentRecord_paymentCompleted_paymentId_key";

-- DropIndex
DROP INDEX "PaymentRecord_paymentId_paymentCompleted_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_pkey",
DROP COLUMN "invoiceId",
DROP COLUMN "invoicePaid",
DROP COLUMN "paymentRecordId",
DROP COLUMN "price",
DROP COLUMN "unitNum",
ADD COLUMN     "deposit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "invoiceNum" SERIAL NOT NULL,
ADD COLUMN     "paymentRecordNum" INTEGER,
ADD COLUMN     "stripeId" TEXT,
ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoiceNum");

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "PaymentRecord" DROP CONSTRAINT "PaymentRecord_pkey",
DROP COLUMN "invoiceId",
DROP COLUMN "paymentId",
DROP COLUMN "receiverId",
DROP COLUMN "recordNum",
DROP COLUMN "unitPrice",
ADD COLUMN     "deposit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "invoiceNum" INTEGER,
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "paymentNumber" SERIAL NOT NULL,
ADD COLUMN     "refundNumber" INTEGER,
ADD COLUMN     "refunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeId" TEXT,
ADD CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("paymentNumber");

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "price",
ADD COLUMN     "advertisedPrice" INTEGER NOT NULL,
ADD COLUMN     "leasedPrice" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unavailable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "address" DROP CONSTRAINT "address_pkey",
DROP COLUMN "address3",
DROP COLUMN "contactId",
DROP COLUMN "phoneNum2",
DROP COLUMN "phoneNum2Validated",
DROP COLUMN "zip",
ADD COLUMN     "addressId" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "phoneNum1Country" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD CONSTRAINT "address_pkey" PRIMARY KEY ("addressId");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash",
ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeId" TEXT;

-- DropTable
DROP TABLE "PasswordReset";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "Verification";

-- CreateTable
CREATE TABLE "discountCode" (
    "discountId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amountOff" INTEGER NOT NULL,
    "notes" TEXT,
    "discountCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountEnded" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "discountCode_pkey" PRIMARY KEY ("discountId")
);

-- CreateTable
CREATE TABLE "RefundRecord" (
    "refundNumber" SERIAL NOT NULL,
    "stripeId" TEXT,
    "customerId" TEXT NOT NULL,
    "refundAmount" INTEGER NOT NULL,
    "employeeId" TEXT,
    "refundNotes" TEXT,
    "refundCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundCompleted" TIMESTAMP(3),
    "paymentRecordNum" INTEGER NOT NULL,
    "refundType" "PaymentType" NOT NULL,

    CONSTRAINT "RefundRecord_pkey" PRIMARY KEY ("refundNumber")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "token_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "discountCode_discountId_key" ON "discountCode"("discountId");

-- CreateIndex
CREATE UNIQUE INDEX "discountCode_code_key" ON "discountCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "discountCode_discountId_amountOff_key" ON "discountCode"("discountId", "amountOff");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRecord_refundNumber_key" ON "RefundRecord"("refundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRecord_stripeId_key" ON "RefundRecord"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_token_hash_key" ON "MagicLink"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNum_key" ON "Invoice"("invoiceNum");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paymentRecordNum_key" ON "Invoice"("paymentRecordNum");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeId_key" ON "Invoice"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Lease_leaseId_key" ON "Lease"("leaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Lease_anvilEID_key" ON "Lease"("anvilEID");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_paymentNumber_key" ON "PaymentRecord"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_stripeId_key" ON "PaymentRecord"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_num_key" ON "Unit"("num");

-- CreateIndex
CREATE UNIQUE INDEX "address_addressId_key" ON "address"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("addressId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_discount_discountId_fkey" FOREIGN KEY ("discount", "discountId") REFERENCES "discountCode"("amountOff", "discountId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discountCode" ADD CONSTRAINT "discountCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_refundNumber_fkey" FOREIGN KEY ("refundNumber") REFERENCES "RefundRecord"("refundNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("leaseId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentRecordNum_fkey" FOREIGN KEY ("paymentRecordNum") REFERENCES "PaymentRecord"("paymentNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_email_fkey" FOREIGN KEY ("user_id", "email") REFERENCES "users"("id", "email") ON DELETE RESTRICT ON UPDATE CASCADE;
