-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deadLine" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '1 month';
