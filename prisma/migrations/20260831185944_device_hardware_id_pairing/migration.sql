-- AlterTable
ALTER TABLE "device" ADD COLUMN     "hardwareId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "device_hardwareId_key" ON "device"("hardwareId");
