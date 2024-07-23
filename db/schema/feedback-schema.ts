import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const feedbackTable = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export type InsertFeedback = typeof feedbackTable.$inferInsert
export type SelectFeedback = typeof feedbackTable.$inferSelect