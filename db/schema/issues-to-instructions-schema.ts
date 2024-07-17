import { relations } from "drizzle-orm"
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { instructionsTable } from "./instructions-schema"
import { issuesTable } from "./issues-schema"

export const issuesToInstructionsTable = pgTable(
  "issues_to_instructions",
  {
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issuesTable.id, { onDelete: "cascade" }),
    instructionId: uuid("instruction_id")
      .notNull()
      .references(() => instructionsTable.id, { onDelete: "cascade" })
  },
  t => ({
    pk: primaryKey({ columns: [t.issueId, t.instructionId] })
  })
)

export const issueToInstructionsRelations = relations(
  issuesToInstructionsTable,
  ({ one }) => ({
    issue: one(issuesTable, {
      fields: [issuesToInstructionsTable.issueId],
      references: [issuesTable.id]
    }),
    instruction: one(instructionsTable, {
      fields: [issuesToInstructionsTable.instructionId],
      references: [instructionsTable.id]
    })
  })
)

export type InsertIssuesToInstruction =
  typeof issuesToInstructionsTable.$inferInsert
export type SelectIssuesToInstruction =
  typeof issuesToInstructionsTable.$inferSelect
