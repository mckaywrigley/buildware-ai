import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-http"
import {
  embeddedBranchesRelations,
  embeddedBranchesTable,
  embeddedFilesRelations,
  embeddedFilesTable,
  issueToPromptsRelations,
  issuesRelations,
  issuesTable,
  issuesToPromptsTable,
  profilesTable,
  projectsRelations,
  projectsTable,
  promptsRelations,
  promptsTable,
  templateRelations,
  templateToPromptsRelations,
  templatesTable,
  templatesToPromptsTable,
  issueMessagesTable,
  issueMessagesRelations
} from "./schema"

config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, {
  schema: {
    // Tables
    profiles: profilesTable,
    projects: projectsTable,
    issues: issuesTable,
    templates: templatesTable,
    prompts: promptsTable,
    templatesToPrompts: templatesToPromptsTable,
    embeddedFiles: embeddedFilesTable,
    embeddedBranches: embeddedBranchesTable,
    issuesToPrompts: issuesToPromptsTable,
    issueMessages: issueMessagesTable,

    // Relations
    projectsRelations: projectsRelations,
    issuesRelations: issuesRelations,
    templateRelations: templateRelations,
    promptsRelations: promptsRelations,
    templateToPromptsRelations: templateToPromptsRelations,
    embeddedFilesRelations: embeddedFilesRelations,
    embeddedBranchesRelations: embeddedBranchesRelations,
    issuesToPromptsRelations: issueToPromptsRelations,
    issueMessagesRelations: issueMessagesRelations
  }
})
