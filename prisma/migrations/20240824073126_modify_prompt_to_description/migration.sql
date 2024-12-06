/*
  Warnings:

  - You are about to drop the column `prompt` on the `Picture` table. All the data in the column will be lost.
  - Added the required column `description` to the `Picture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Picture" DROP COLUMN "prompt",
ADD COLUMN     "description" VARCHAR(8192) NOT NULL;
