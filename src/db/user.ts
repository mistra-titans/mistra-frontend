import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})