import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { transactions } from "./transaction";


export const transaction_otp = pgTable("transaction_otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  transaction_id: uuid("transaction_id").notNull().references(() => transactions.id),
  code: varchar("code").notNull().unique(),
  used: boolean("used").default(false),
  created_at: timestamp().defaultNow()
})