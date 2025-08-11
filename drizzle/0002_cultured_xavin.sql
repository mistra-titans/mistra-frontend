CREATE TYPE "public"."currency" AS ENUM('GHC', 'USD', 'NGN');--> statement-breakpoint
CREATE TABLE "ledger" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" bigint NOT NULL,
	"currency" "currency" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
