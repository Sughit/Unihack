/*
  Warnings:

  - Made the column `auth0Id` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "auth0Id" SET NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
