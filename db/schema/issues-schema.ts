import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { issueMessagesTable } from "./issue-messages-schema"
import { issuesToInstructionsTable } from "./issues-to-instructions-schema"
import { projectsTable } from "./projects-schema"

export const issuesTable = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("ready"),
  prLink: text("pr_link"),
  prBranch: text("pr_branch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const issuesRelations = relations(issuesTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [issuesTable.projectId],
    references: [projectsTable.id]
  }),
  issueToInstructions: many(issuesToInstructionsTable),
  issueMessages: many(issueMessagesTable)
}))

export type InsertIssue = typeof issuesTable.$inferInsert
export type SelectIssue = typeof issuesTable.$inferSelect
