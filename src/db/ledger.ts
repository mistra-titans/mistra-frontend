import { bigint, char, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { CURRENCY } from "./currency";
import { transactions } from "./transacction";
import { accounts } from "./account";

export const ledger = pgTable('ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  delta: bigint('balance', { mode: 'number' }).notNull(),
  transaction_id: uuid('transaction_id').notNull().references(() => transactions.id),
  account: varchar({ length: 20 }).references(() => accounts.account_number),
  currency: CURRENCY('currency').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull(),
});