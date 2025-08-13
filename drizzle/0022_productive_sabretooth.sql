ALTER TABLE "transactions" ADD COLUMN "worker_type" varchar(100);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "original_payload" jsonb;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "max_retries" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "attempt_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "next_retry_at" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "dead_lettered_at" timestamp;