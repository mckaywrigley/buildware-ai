import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { runsTable } from "./runs-schema"

export const runStepsTable = pgTable("run_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runsTable.id, { onDelete: "cascade" }),
  stepName: text("step_name").notNull(),
  status: text("status").notNull().default("not_started"),
  cost: text("cost").notNull().default("0"),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const runStepsRelations = relations(runStepsTable, ({ one }) => ({
  run: one(runsTable, {
    fields: [runStepsTable.runId],
    references: [runsTable.id]
  })
}))

export type InsertRunStep = typeof runStepsTable.$inferInsert
export type SelectRunStep = typeof runStepsTable.$inferSelect