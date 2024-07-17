import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { instructionsTable } from "./instructions-schema"
import { templatesTable } from "./templates-schema"
import { workspacesTable } from "./workspaces-schema"
import { issuesTable } from "./issues-schema"

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspacesTable.id, {
      onDelete: "cascade"
    }),
  name: text("name").notNull(),
  githubRepoFullName: text("github_repo_full_name"),
  githubTargetBranch: text("github_target_branch"),
  githubInstallationId: integer("github_installation_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  templates: many(templatesTable),
  instructions: many(instructionsTable),
  workspace: one(workspacesTable),
  issues: many(issuesTable)
}))

export type InsertProject = typeof projectsTable.$inferInsert
export type SelectProject = typeof projectsTable.$inferSelect
