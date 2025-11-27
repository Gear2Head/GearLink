-- AlterTable
ALTER TABLE "users" 
  ALTER COLUMN "phoneNumber" DROP NOT NULL,
  ALTER COLUMN "phoneCountry" DROP NOT NULL,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "password" TEXT,
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
