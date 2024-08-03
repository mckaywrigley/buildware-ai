import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { contextGroupsTable } from "./context-groups-schema"

export const contextGroupFilesTable = pgTable("context_group_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  contextGroupId: uuid("context_group_id")
    .notNull()
    .references(() => contextGroupsTable.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const contextGroupFilesRelations = relations(contextGroupFilesTable, ({ one }) => ({
  contextGroup: one(contextGroupsTable, {
    fields: [contextGroupFilesTable.contextGroupId],
    references: [contextGroupsTable.id]
  })
}))

export type InsertContextGroupFile = typeof contextGroupFilesTable.$inferInsert
export type SelectContextGroupFile = typeof contextGroupFilesTable.$inferSelect