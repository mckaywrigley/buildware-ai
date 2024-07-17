import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertProfile = typeof profilesTable.$inferInsert
export type SelectProfile = typeof profilesTable.$inferSelect
