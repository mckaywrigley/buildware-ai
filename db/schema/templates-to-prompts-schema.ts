import { relations } from "drizzle-orm"
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { promptsTable } from "./prompts-schema"
import { templatesTable } from "./templates-schema"

export const templatesToPromptsTable = pgTable(
  "templates_to_prompts",
  {
    templateId: uuid("template_id")
      .notNull()
      .references(() => templatesTable.id, { onDelete: "cascade" }),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => promptsTable.id, { onDelete: "cascade" })
  },
  t => ({
    pk: primaryKey({ columns: [t.templateId, t.promptId] })
  })
)

export const templateToPromptsRelations = relations(
  templatesToPromptsTable,
  ({ one }) => ({
    template: one(templatesTable, {
      fields: [templatesToPromptsTable.templateId],
      references: [templatesTable.id]
    }),
    prompt: one(promptsTable, {
      fields: [templatesToPromptsTable.promptId],
      references: [promptsTable.id]
    })
  })
)

export type InsertTemplatesToPrompt =
  typeof templatesToPromptsTable.$inferInsert
export type SelectTemplatesToPrompt =
  typeof templatesToPromptsTable.$inferSelect
