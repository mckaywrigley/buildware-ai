import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid, integer, decimal } from "drizzle-orm/pg-core"
import { issuesTable } from "./issues-schema"
import { projectsTable } from "./projects-schema"

export const runsTable = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issuesTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const runStepsTable = pgTable("run_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runsTable.id, { onDelete: "cascade" }),
  stepName: text("step_name").notNull(),
  status: text("status").notNull().default("not_started"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  response: text("response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const runsRelations = relations(runsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [runsTable.projectId],
    references: [projectsTable.id]
  }),
  issue: one(issuesTable, {
    fields: [runsTable.issueId],
    references: [issuesTable.id]
  }),
  steps: many(runStepsTable)
}))

export const runStepsRelations = relations(runStepsTable, ({ one }) => ({
  run: one(runsTable, {
    fields: [runStepsTable.runId],
    references: [runsTable.id]
  })
}))

export type InsertRun = typeof runsTable.$inferInsert
export type SelectRun = typeof runsTable.$inferSelect
export type InsertRunStep = typeof runStepsTable.$inferInsert
export type SelectRunStep = typeof runStepsTable.$inferSelect