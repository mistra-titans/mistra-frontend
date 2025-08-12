ALTER TABLE "accounts" ALTER COLUMN "account_number" SET DATA TYPE char(14);--> statement-breakpoint
ALTER TABLE "ledger" ALTER COLUMN "account" SET DATA TYPE varchar(14);--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "recipient_account" SET DATA TYPE varchar(14);--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "sender_account" SET DATA TYPE varchar(14);