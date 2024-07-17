import { relations } from "drizzle-orm"
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { instructionsTable } from "./instructions-schema"
import { templatesTable } from "./templates-schema"

export const templatesToInstructionsTable = pgTable(
  "templates_to_instructions",
  {
    templateId: uuid("template_id")
      .notNull()
      .references(() => templatesTable.id, { onDelete: "cascade" }),
    instructionId: uuid("instruction_id")
      .notNull()
      .references(() => instructionsTable.id, { onDelete: "cascade" })
  },
  t => ({
    pk: primaryKey({ columns: [t.templateId, t.instructionId] })
  })
)

export const templateToInstructionsRelations = relations(
  templatesToInstructionsTable,
  ({ one }) => ({
    template: one(templatesTable, {
      fields: [templatesToInstructionsTable.templateId],
      references: [templatesTable.id]
    }),
    instruction: one(instructionsTable, {
      fields: [templatesToInstructionsTable.instructionId],
      references: [instructionsTable.id]
    })
  })
)

export type InsertTemplatesToInstruction =
  typeof templatesToInstructionsTable.$inferInsert
export type SelectTemplatesToInstruction =
  typeof templatesToInstructionsTable.$inferSelect
