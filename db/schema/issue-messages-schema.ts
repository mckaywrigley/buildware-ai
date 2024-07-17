import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { issuesTable } from "./issues-schema"

export const issueMessagesTable = pgTable("issue_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issuesTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sequence: integer("sequence").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const issueMessagesRelations = relations(
  issueMessagesTable,
  ({ one }) => ({
    issue: one(issuesTable, {
      fields: [issueMessagesTable.issueId],
      references: [issuesTable.id]
    })
  })
)

export type InsertIssueMessage = typeof issueMessagesTable.$inferInsert
export type SelectIssueMessage = typeof issueMessagesTable.$inferSelect
