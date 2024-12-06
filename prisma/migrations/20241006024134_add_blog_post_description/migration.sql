/*
  Warnings:

  - Added the required column `status` to the `blog_posts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "description" VARCHAR(1000),
ADD COLUMN     "status" "BlogPostStatus" NOT NULL;
