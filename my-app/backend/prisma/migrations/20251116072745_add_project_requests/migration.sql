-- CreateEnum
CREATE TYPE "ProjectRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DENIED');

-- CreateTable
CREATE TABLE "ProjectRequest" (
    "id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "chatId" INTEGER,
    "budget" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "notes" TEXT,
    "status" "ProjectRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
