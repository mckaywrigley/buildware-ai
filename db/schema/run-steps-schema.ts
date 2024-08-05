import { relations } from "drizzle-orm"
import {
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { runsTable } from "./runs-schema"

export const runStepNameEnum = pgEnum("run_step_name", [
  "started",
  "embedding",
  "retrieval",
  "specification",
  "plan",
  "implementation",
  "pr",
  "completed"
])

export const runStepStatusEnum = pgEnum("run_step_status", [
  "in_progress",
  "waiting",
  "completed",
  "failed"
])

export const runStepsTable = pgTable("run_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runsTable.id, { onDelete: "cascade" }),
  name: runStepNameEnum("name"),
  status: runStepStatusEnum("status"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0"),
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
