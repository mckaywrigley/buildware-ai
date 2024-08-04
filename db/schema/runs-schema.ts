import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { issuesTable } from "./issues-schema"

export const runsTable = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id").notNull().references(() => issuesTable.id),
  status: text("status").notNull().default("in_progress"),
  totalCost: numeric("total_cost").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
})

export const runStepsTable = pgTable("run_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runsTable.id),
  stepName: text("step_name").notNull(),
  status: text("status").notNull().default("not_started"),
  result: jsonb("result"),
  cost: numeric("cost").notNull().default("0"),
  tokenUsage: integer("token_usage").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
})

export type InsertRun = typeof runsTable.$inferInsert
export type SelectRun = typeof runsTable.$inferSelect
export type InsertRunStep = typeof runStepsTable.$inferInsert
export type SelectRunStep = typeof runStepsTable.$inferSelect