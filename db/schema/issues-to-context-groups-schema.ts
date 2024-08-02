import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { issuesTable } from "./issues-schema"
import { contextGroups } from "./context-groups-schema"

export const issuesToContextGroups = pgTable(
  "issues_to_context_groups",
  {
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issuesTable.id, { onDelete: "cascade" }),
    contextGroupId: uuid("context_group_id")
      .notNull()
      .references(() => contextGroups.id, { onDelete: "cascade" })
  },
  t => ({
    pk: primaryKey({ columns: [t.issueId, t.contextGroupId] })
  })
)

export const issuesToContextGroupsRelations = relations(
  issuesToContextGroups,
  ({ one }) => ({
    issue: one(issuesTable, {
      fields: [issuesToContextGroups.issueId],
      references: [issuesTable.id]
    }),
    contextGroup: one(contextGroups, {
      fields: [issuesToContextGroups.contextGroupId],
      references: [contextGroups.id]
    })
  })
)

export type SelectIssueToContextGroup =
  typeof issuesToContextGroups.$inferSelect
export type InsertIssueToContextGroup =
  typeof issuesToContextGroups.$inferInsert
