import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { instructionsTable } from "./instructions-schema"
import { templatesTable } from "./templates-schema"
import { workspacesTable } from "./workspaces-schema"

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspacesTable.id, {
      onDelete: "cascade"
    }),
  name: text("name").notNull(),
  hasSetup: boolean("has_setup").default(false).notNull(),
  githubRepoFullName: text("github_repo_full_name"),
  githubTargetBranch: text("github_target_branch"),
  githubInstallationId: integer("github_installation_id"),
  linearAccessToken: text("linear_access_token"),
  linearOrganizationId: text("linear_organization_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  templates: many(templatesTable),
  instructions: many(instructionsTable),
  workspace: one(workspacesTable)
}))

export type InsertProject = typeof projectsTable.$inferInsert
export type SelectProject = typeof projectsTable.$inferSelect
