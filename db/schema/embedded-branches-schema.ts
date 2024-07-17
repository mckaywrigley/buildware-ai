import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projectsTable } from "./projects-schema"

export const embeddedBranchesTable = pgTable("embedded_branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  githubRepoFullName: text("github_repo_full_name").notNull(),
  branchName: text("branch_name").notNull(),
  lastEmbeddedCommitHash: text("last_embedded_commit_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const embeddedBranchesRelations = relations(
  embeddedBranchesTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [embeddedBranchesTable.projectId],
      references: [projectsTable.id]
    })
  })
)

export type InsertEmbeddedBranch = typeof embeddedBranchesTable.$inferInsert
export type SelectEmbeddedBranch = typeof embeddedBranchesTable.$inferSelect
