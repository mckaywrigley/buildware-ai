import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { issuesToInstructionsTable } from "./issues-to-instructions-schema"
import { projectsTable } from "./projects-schema"
import { templatesToInstructionsTable } from "./templates-to-instructions-schema"

export const instructionsTable = pgTable("instructions", {
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

export const instructionsRelations = relations(
  instructionsTable,
  ({ one, many }) => ({
    templatesToInstructions: many(templatesToInstructionsTable),
    issueToInstructions: many(issuesToInstructionsTable),
    project: one(projectsTable, {
      fields: [instructionsTable.projectId],
      references: [projectsTable.id]
    })
  })
)

export type InsertInstruction = typeof instructionsTable.$inferInsert
export type SelectInstruction = typeof instructionsTable.$inferSelect
