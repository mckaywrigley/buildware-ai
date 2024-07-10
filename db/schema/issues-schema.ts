import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projectsTable } from "./projects-schema"
import { issuesToPromptsTable } from "./issues-to-prompts-schema"
import { issueMessagesTable } from "./issue-messages-schema"

export const issuesTable = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("ready"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const issuesRelations = relations(issuesTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [issuesTable.projectId],
    references: [projectsTable.id]
  }),
  issueToPrompts: many(issuesToPromptsTable),
  issueMessages: many(issueMessagesTable)
}))

export type InsertIssue = typeof issuesTable.$inferInsert
export type SelectIssue = typeof issuesTable.$inferSelect
