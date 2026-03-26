/*
  Warnings:

  - A unique constraint covering the columns `[macAddress]` on the table `device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `macAddress` to the `device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "device" ADD COLUMN     "macAddress" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "device_macAddress_key" ON "device"("macAddress");

-- CreateIndex
CREATE INDEX "device_macAddress_idx" ON "device"("macAddress");
