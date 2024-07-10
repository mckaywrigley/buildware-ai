import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projectsTable } from "./projects-schema"
import { templatesToPromptsTable } from "./templates-to-prompts-schema"
import { issuesToPromptsTable } from "./issues-to-prompts-schema"

export const promptsTable = pgTable("prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const promptsRelations = relations(promptsTable, ({ one, many }) => ({
  templatesToPrompts: many(templatesToPromptsTable),
  issueToPrompts: many(issuesToPromptsTable),
  project: one(projectsTable, {
    fields: [promptsTable.projectId],
    references: [projectsTable.id]
  })
}))

export type InsertPrompt = typeof promptsTable.$inferInsert
export type SelectPrompt = typeof promptsTable.$inferSelect
