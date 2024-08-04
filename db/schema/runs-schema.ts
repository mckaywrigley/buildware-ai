import { pgTable, uuid, timestamp, text, integer, jsonb } from "drizzle-orm/pg-core"
import { projectsTable } from "./projects-schema"

export const runsTable = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id),
  status: text("status").notNull(),
  totalCost: integer("total_cost").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const runStepsTable = pgTable("run_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => runsTable.id),
  stepName: text("step_name").notNull(),
  status: text("status").notNull(),
  data: jsonb("data"),
  cost: integer("cost").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export type InsertRun = typeof runsTable.$inferInsert
export type SelectRun = typeof runsTable.$inferSelect
export type InsertRunStep = typeof runStepsTable.$inferInsert
export type SelectRunStep = typeof runStepsTable.$inferSelect