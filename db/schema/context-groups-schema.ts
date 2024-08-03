import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projectsTable } from "./projects-schema"
import { contextGroupFilesTable } from "./context-group-files-schema"

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

export const contextGroupsRelations = relations(contextGroupsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [contextGroupsTable.projectId],
    references: [projectsTable.id]
  }),
  files: many(contextGroupFilesTable)
}))

export type InsertContextGroup = typeof contextGroupsTable.$inferInsert
export type SelectContextGroup = typeof contextGroupsTable.$inferSelect