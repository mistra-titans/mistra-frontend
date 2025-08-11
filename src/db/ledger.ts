import { bigint, char, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENCY } from "./currency";
import { transactions } from "./transacction";

export const ledger = pgTable('ledger', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull(),
  delta: bigint('balance', { mode: 'number' }).notNull(),
  transaction_id: uuid('transaction_id').notNull().references(() => transactions.id),
  currency: CURRENCY('currency').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});