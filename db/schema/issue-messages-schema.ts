import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { issuesTable } from "./issues-schema"

export const issueMessagesTable = pgTable("issue_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issuesTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  sequence: integer("sequence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const issueMessagesRelations = relations(issueMessagesTable, ({ one }) => ({
  issue: one(issuesTable, {
    fields: [issueMessagesTable.issueId],
    references: [issuesTable.id]
  })
}))

export type InsertIssueMessage = typeof issueMessagesTable.$inferInsert
export type SelectIssueMessage = typeof issueMessagesTable.$inferSelect