/*
  Warnings:

  - Added the required column `ticketType` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketType" INTEGER NOT NULL;
