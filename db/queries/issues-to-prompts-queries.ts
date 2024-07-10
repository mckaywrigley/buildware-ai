"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { issuesToPromptsTable } from "../schema/issues-to-prompts-schema"

export async function addPromptToIssue(issueId: string, promptId: string) {
  try {
    await db.insert(issuesToPromptsTable).values({ issueId, promptId })
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding prompt to issue:", error)
    throw error
  }
}

export async function removePromptFromIssue(issueId: string, promptId: string) {
  try {
    await db
      .delete(issuesToPromptsTable)
      .where(
        and(
          eq(issuesToPromptsTable.issueId, issueId),
          eq(issuesToPromptsTable.promptId, promptId)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing prompt from issue:", error)
    throw error
  }
}

export async function getPromptsForIssue(issueId: string) {
  try {
    return db.query.issuesToPrompts.findMany({
      where: eq(issuesToPromptsTable.issueId, issueId),
      with: {
        prompt: {
          columns: {
            id: true,
            title: true,
            content: true
          }
        }
      }
    })
  } catch (error) {
    console.error("Error getting prompts for issue:", error)
    throw error
  }
}
