import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { TRANSACTION_STATUS } from "./transaction";

export const failedTransactions = pgTable('failed_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: varchar('transaction_id', { length: 255 }).notNull(),
  workerType: varchar('worker_type', { length: 100 }).notNull(),
  originalPayload: jsonb('original_payload').notNull(),
  maxRetries: integer('max_retries').notNull(),
  attemptCount: integer('attempt_count').default(0).notNull(),
  nextRetryAt: timestamp('next_retry_at').notNull(),
  lastError: text('last_error'),
  status: TRANSACTION_STATUS('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deadLetteredAt: timestamp('dead_lettered_at'),
  finalError: text('final_error')
})

export type FailedTransaction = typeof failedTransactions.$inferSelect
export type NewFailedTransaction = typeof failedTransactions.$inferInsert