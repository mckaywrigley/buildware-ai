import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { contextGroups } from "./context-groups-schema"
import { embeddedFilesTable } from "./embedded-files-schema"

export const contextGroupsToEmbeddedFiles = pgTable(
  "context_groups_to_embedded_files",
  {
    contextGroupId: uuid("context_group_id")
      .notNull()
      .references(() => contextGroups.id, { onDelete: "cascade" }),
    embeddedFileId: uuid("embedded_file_id")
      .notNull()
      .references(() => embeddedFilesTable.id, { onDelete: "cascade" })
  },
  t => ({
    pk: primaryKey({ columns: [t.contextGroupId, t.embeddedFileId] })
  })
)

export const contextGroupsToEmbeddedFilesRelations = relations(
  contextGroupsToEmbeddedFiles,
  ({ one }) => ({
    contextGroup: one(contextGroups, {
      fields: [contextGroupsToEmbeddedFiles.contextGroupId],
      references: [contextGroups.id]
    }),
    embeddedFile: one(embeddedFilesTable, {
      fields: [contextGroupsToEmbeddedFiles.embeddedFileId],
      references: [embeddedFilesTable.id]
    })
  })
)

export type SelectContextGroupToEmbeddedFile =
  typeof contextGroupsToEmbeddedFiles.$inferSelect
export type InsertContextGroupToEmbeddedFile =
  typeof contextGroupsToEmbeddedFiles.$inferInsert
