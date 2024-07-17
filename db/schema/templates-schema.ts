import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { issuesTable } from "./issues-schema"
import { projectsTable } from "./projects-schema"
import { templatesToInstructionsTable } from "./templates-to-instructions-schema"

export const templatesTable = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const templateRelations = relations(templatesTable, ({ one, many }) => ({
  templatesToInstructions: many(templatesToInstructionsTable),
  issues: many(issuesTable),
  project: one(projectsTable, {
    fields: [templatesTable.projectId],
    references: [projectsTable.id]
  })
}))

export type InsertTemplate = typeof templatesTable.$inferInsert
export type SelectTemplate = typeof templatesTable.$inferSelect
