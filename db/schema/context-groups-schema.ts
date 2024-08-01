import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { contextGroupsToEmbeddedFiles } from "./context-groups-to-embedded-files-schema"
import { relations } from "drizzle-orm"
import { projectsTable } from "./projects-schema"

export const contextGroups = pgTable("context_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const contextGroupsRelations = relations(contextGroups, ({ many }) => ({
  contextGroupsToEmbeddedFiles: many(contextGroupsToEmbeddedFiles)
}))

export type SelectContextGroup = typeof contextGroups.$inferSelect
export type InsertContextGroup = typeof contextGroups.$inferInsert
