import { relations } from "drizzle-orm"
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { promptsTable } from "./prompts-schema"
import { issuesTable } from "./issues-schema"

export const issuesToPromptsTable = pgTable(
  "issues_to_prompts",
  {
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issuesTable.id, { onDelete: "cascade" }),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => promptsTable.id, { onDelete: "cascade" })
  },
  t => ({
    pk: primaryKey({ columns: [t.issueId, t.promptId] })
  })
)

export const issueToPromptsRelations = relations(
  issuesToPromptsTable,
  ({ one }) => ({
    issue: one(issuesTable, {
      fields: [issuesToPromptsTable.issueId],
      references: [issuesTable.id]
    }),
    prompt: one(promptsTable, {
      fields: [issuesToPromptsTable.promptId],
      references: [promptsTable.id]
    })
  })
)

export type InsertIssuesToPrompt =
  typeof issuesToPromptsTable.$inferInsert
export type SelectIssuesToPrompt =
  typeof issuesToPromptsTable.$inferSelect
