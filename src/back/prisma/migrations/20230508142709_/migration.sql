/*
  Warnings:

  - You are about to drop the column `authId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_authId_key";

-- DropIndex
DROP INDEX "User_displayName_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authId",
DROP COLUMN "displayName";
