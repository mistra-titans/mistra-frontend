import { pgTable, serial, text } from "drizzle-orm/pg-core";


export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})