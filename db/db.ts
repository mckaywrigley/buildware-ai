import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-http"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

const dbSchema = {
  // Tables
  profiles: schema.profilesTable,
  projects: schema.projectsTable,
  issues: schema.issuesTable,
  templates: schema.templatesTable,
  prompts: schema.promptsTable,
  templatesToPrompts: schema.templatesToPromptsTable,
  embeddedFiles: schema.embeddedFilesTable,
  embeddedBranches: schema.embeddedBranchesTable,
  issuesToPrompts: schema.issuesToPromptsTable,
  issueMessages: schema.issueMessagesTable,
  workspaces: schema.workspacesTable,

  // Relations
  projectsRelations: schema.projectsRelations,
  issuesRelations: schema.issuesRelations,
  templateRelations: schema.templateRelations,
  promptsRelations: schema.promptsRelations,
  templateToPromptsRelations: schema.templateToPromptsRelations,
  embeddedFilesRelations: schema.embeddedFilesRelations,
  embeddedBranchesRelations: schema.embeddedBranchesRelations,
  issuesToPromptsRelations: schema.issueToPromptsRelations,
  issueMessagesRelations: schema.issueMessagesRelations,
  workspacesRelations: schema.workspacesRelations
}

function initializeDb(url: string) {
  const isNeon = url.includes("neon")

  if (isNeon) {
    const client = neon(url)
    return drizzle(client, { schema: dbSchema })
  } else {
    const client = postgres(url, { prepare: false })
    return drizzlePostgres(client, { schema: dbSchema })
  }
}

export const db = initializeDb(databaseUrl)
