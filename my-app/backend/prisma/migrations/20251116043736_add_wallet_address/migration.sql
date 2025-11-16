/*
  Edited migration:

  - NU mai modificăm tabela "Message" (presupunem că are deja chatName, chatId, senderId)
  - NU mai recreăm tabela "Chat" (presupunem că există deja)
  - Adăugăm doar coloana "walletAddress" pe "User"
  - Creăm tabela "UserBadge" + FK spre "User"
*/

-- AlterTable: adăugăm doar walletAddress la User
ALTER TABLE "User" ADD COLUMN     "walletAddress" TEXT;

-- CreateTable: UserBadge (dacă nu există încă)
CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey pentru UserBadge -> User
DO $$
BEGIN
    -- evităm eroarea dacă FK există deja
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'UserBadge_userId_fkey'
          AND table_name = 'UserBadge'
    ) THEN
        ALTER TABLE "UserBadge"
        ADD CONSTRAINT "UserBadge_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
