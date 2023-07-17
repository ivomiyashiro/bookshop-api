/*
  Warnings:

  - The values [CANCELLED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shippingAddressId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shippingAddressId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('DELIVERED', 'PENDING');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PAID', 'PENDING');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" TYPE "OrderStatus_new" USING ("paymentStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "paymentStatus" "OrderStatus" NOT NULL DEFAULT 'PAID',
ADD COLUMN     "shippingAddressId" INTEGER NOT NULL,
ADD COLUMN     "shippingStatus" "ShippingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ShippingAddress" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "zip" TEXT NOT NULL,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_shippingAddressId_key" ON "Order"("shippingAddressId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "ShippingAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
