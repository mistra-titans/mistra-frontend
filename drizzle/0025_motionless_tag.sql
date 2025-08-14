CREATE TABLE "transaction_otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"code" varchar NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "transaction_otp_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "transaction_otp" ADD CONSTRAINT "transaction_otp_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;