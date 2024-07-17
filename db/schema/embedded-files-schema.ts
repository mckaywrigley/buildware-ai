import { BUILDWARE_EMBEDDING_DIMENSIONS } from "@/buildware/buildware-config"
import dotenv from "dotenv"
import { relations } from "drizzle-orm"
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  vector
} from "drizzle-orm/pg-core"
import { embeddedBranchesTable } from "./embedded-branches-schema"
import { projectsTable } from "./projects-schema"

dotenv.config({ path: ".env.local" })

export const embeddedFilesTable = pgTable(
  "embedded_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    embeddedBranchId: uuid("embedded_branch_id")
      .notNull()
      .references(() => embeddedBranchesTable.id, { onDelete: "cascade" }),
    githubRepoFullName: text("github_repo_full_name").notNull(),
    path: text("path").notNull(),
    content: text("content"),
    tokenCount: integer("token_count").notNull(),
    embedding: vector("embedding", {
      dimensions: BUILDWARE_EMBEDDING_DIMENSIONS
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => ({
    embedding_index: index("embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    )
  })
)

export const embeddedFilesRelations = relations(
  embeddedFilesTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [embeddedFilesTable.projectId],
      references: [projectsTable.id]
    })
  })
)

export type InsertEmbeddedFile = typeof embeddedFilesTable.$inferInsert
export type SelectEmbeddedFile = typeof embeddedFilesTable.$inferSelect
