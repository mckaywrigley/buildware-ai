import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projectsTable } from "./projects-schema"

export const contextGroupsTable = pgTable("context_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const contextGroupFilesTable = pgTable("context_group_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  contextGroupId: uuid("context_group_id")
    .notNull()
    .references(() => contextGroupsTable.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
})

export const contextGroupsRelations = relations(contextGroupsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [contextGroupsTable.projectId],
    references: [projectsTable.id]
  }),
  files: many(contextGroupFilesTable)
}))

export const contextGroupFilesRelations = relations(contextGroupFilesTable, ({ one }) => ({
  contextGroup: one(contextGroupsTable, {
    fields: [contextGroupFilesTable.contextGroupId],
    references: [contextGroupsTable.id]
  })
}))

export type InsertContextGroup = typeof contextGroupsTable.$inferInsert
export type SelectContextGroup = typeof contextGroupsTable.$inferSelect
export type InsertContextGroupFile = typeof contextGroupFilesTable.$inferInsert
export type SelectContextGroupFile = typeof contextGroupFilesTable.$inferSelect