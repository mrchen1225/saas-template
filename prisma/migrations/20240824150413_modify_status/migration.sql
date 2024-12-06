/*
  Warnings:

  - The values [UNKNOWN,GENERATING,ONLINE] on the enum `PictureStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PictureStatus_new" AS ENUM ('UPLOADED', 'DESCRIBED', 'PAID', 'PROCESSED', 'PROCESSING', 'PROCESSING_FAILED', 'PROCESSING_SUCCESS', 'DEIVERTED', 'DELETED');
ALTER TABLE "Picture" ALTER COLUMN "status" TYPE "PictureStatus_new" USING ("status"::text::"PictureStatus_new");
ALTER TYPE "PictureStatus" RENAME TO "PictureStatus_old";
ALTER TYPE "PictureStatus_new" RENAME TO "PictureStatus";
DROP TYPE "PictureStatus_old";
COMMIT;
