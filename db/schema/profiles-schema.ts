import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertProfile = typeof profilesTable.$inferInsert
export type SelectProfile = typeof profilesTable.$inferSelect
