ALTER TABLE "ledger" RENAME COLUMN "recipient_account" TO "account";--> statement-breakpoint
ALTER TABLE "ledger" DROP CONSTRAINT "ledger_recipient_account_accounts_account_number_fk";
--> statement-breakpoint
ALTER TABLE "ledger" DROP CONSTRAINT "ledger_sender_account_accounts_account_number_fk";
--> statement-breakpoint
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_account_accounts_account_number_fk" FOREIGN KEY ("account") REFERENCES "public"."accounts"("account_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger" DROP COLUMN "sender_account";