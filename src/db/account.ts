import { bigint, char, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";


export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  currency: char('currency', { length: 3 }).notNull(),
  account_number: char('account_number', { length: 20 }).notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull(),
});