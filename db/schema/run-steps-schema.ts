"use server"

import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const runStepsTable = pgTable("run_steps", {
  id: uuid("id").primaryKey(),
  issueId: uuid("issue_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  projectId: uuid("project_id").notNull(),
  stepName: varchar("step_name", { length: 255 }).notNull(),
  stepStatus: varchar("step_status", { length: 255 }).notNull(),
  stepResponse: varchar("step_response", { length: 65535 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertRunStep = {
  issueId: string;
  userId: string;
  projectId: string;
  stepName: string;
  stepStatus: string;
  stepResponse: string;
};

export type SelectRunStep = {
  id: string;
  issueId: string;
  userId: string;
  projectId: string;
  stepName: string;
  stepStatus: string;
  stepResponse: string;
  createdAt: Date;
  updatedAt: Date;
};