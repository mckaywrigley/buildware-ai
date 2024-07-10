import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { promptsTable } from "./prompts-schema"
import { templatesTable } from "./templates-schema"

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
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

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  templates: many(templatesTable),
  prompts: many(promptsTable)
}))

export type InsertProject = typeof projectsTable.$inferInsert
export type SelectProject = typeof projectsTable.$inferSelect