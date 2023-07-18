/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CANCELLED', 'PAID', 'PENDING');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentStatus",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PAID';

-- DropEnum
DROP TYPE "PaymentStatus";
