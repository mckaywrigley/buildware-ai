import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { issuesTable } from "./issues-schema"
import { runStepNameEnum, runStepsTable } from "./run-steps-schema"

export const runStatusEnum = pgEnum("run_status", [
  "in_progress",
  "waiting",
  "completed",
  "failed"
])

export const runsTable = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issuesTable.id, { onDelete: "cascade" }),
  status: runStatusEnum("status"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  currentStep: runStepNameEnum("current_step"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const runsRelations = relations(runsTable, ({ one, many }) => ({
  issue: one(issuesTable, {
    fields: [runsTable.issueId],
    references: [issuesTable.id]
  }),
  steps: many(runStepsTable)
}))

export type InsertRun = typeof runsTable.$inferInsert
export type SelectRun = typeof runsTable.$inferSelect