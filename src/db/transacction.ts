import { bigint, char, pgEnum, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const TRANSACTION_STATUS = pgEnum('transaction_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELED',
]);

export const TRANSACTION_TYPE = pgEnum('transaction_type', [
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER',
  'REFUND',
  'SUBSCRIPTION',
]);

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  amount_base: bigint('amount_base', { mode: 'number' }).notNull(),
  currency: char('currency', { length: 3 }).notNull(),
  type: TRANSACTION_TYPE('type').notNull(),
  status: TRANSACTION_STATUS('status').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});