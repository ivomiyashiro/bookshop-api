/*
  Warnings:

  - You are about to drop the column `shippingStatus` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippingStatus";

-- DropEnum
DROP TYPE "ShippingStatus";
