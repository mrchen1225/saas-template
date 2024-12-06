-- AlterTable
ALTER TABLE "ShareActivation" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "ShareLink" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
