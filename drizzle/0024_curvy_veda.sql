ALTER TABLE "payments" DROP CONSTRAINT "payments_payer_account_accounts_account_number_fk";
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "num_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "payer_account";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "used";