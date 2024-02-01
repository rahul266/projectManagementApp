/*
  Warnings:

  - You are about to drop the column `Description` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `TicketStatus` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `description` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketStatus` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_TicketStatus_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "Description",
DROP COLUMN "Name",
DROP COLUMN "TicketStatus",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "priority" INTEGER NOT NULL,
ADD COLUMN     "ticketStatus" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProjectUserMapping" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectUserMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Priority" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Priority_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketStatus_fkey" FOREIGN KEY ("ticketStatus") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_priority_fkey" FOREIGN KEY ("priority") REFERENCES "Priority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUserMapping" ADD CONSTRAINT "ProjectUserMapping_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUserMapping" ADD CONSTRAINT "ProjectUserMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
