CREATE TYPE "public"."payment_method" AS ENUM('LINK', 'VCARD');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."subscription_interval" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'PAYMENT' BEFORE 'REFUND';--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payer_account" char(14),
	"recipient_account" char(14),
	"transaction_id" uuid,
	"amount" bigint NOT NULL,
	"currency" "currency" NOT NULL,
	"method" "payment_method" NOT NULL,
	"link_token" char(43),
	"vcard_data" text,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	CONSTRAINT "payments_link_token_unique" UNIQUE("link_token")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bearer_account" char(14) NOT NULL,
	"amount" bigint NOT NULL,
	"currency" "currency" NOT NULL,
	"interval" "subscription_interval" NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_account_accounts_account_number_fk" FOREIGN KEY ("payer_account") REFERENCES "public"."accounts"("account_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recipient_account_accounts_account_number_fk" FOREIGN KEY ("recipient_account") REFERENCES "public"."accounts"("account_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_bearer_account_accounts_account_number_fk" FOREIGN KEY ("bearer_account") REFERENCES "public"."accounts"("account_number") ON DELETE no action ON UPDATE no action;