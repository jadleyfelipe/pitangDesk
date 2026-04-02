/*
  Warnings:

  - You are about to drop the `ticket_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ticket_history" DROP CONSTRAINT "ticket_history_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_history" DROP CONSTRAINT "ticket_history_user_id_fkey";

-- DropTable
DROP TABLE "ticket_history";

-- CreateIndex
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- CreateIndex
CREATE INDEX "ticket_attachments_ticket_id_idx" ON "ticket_attachments"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_attachments_message_id_idx" ON "ticket_attachments"("message_id");
