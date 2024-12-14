-- AlterTable
ALTER TABLE "buyer" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "seller" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false;
