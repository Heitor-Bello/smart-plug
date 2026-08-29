-- CreateTable
CREATE TABLE "insight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "range" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insight_userId_deviceId_range_idx" ON "insight"("userId", "deviceId", "range");

-- AddForeignKey
ALTER TABLE "insight" ADD CONSTRAINT "insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
