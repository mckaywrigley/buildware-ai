"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { templatesToPromptsTable } from "../schema/templates-to-prompts-schema"

export async function addPromptToTemplate(
  templateId: string,
  promptId: string
) {
  try {
    await db.insert(templatesToPromptsTable).values({ templateId, promptId })
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding prompt to template:", error)
    throw error
  }
}

export async function removePromptFromTemplate(
  templateId: string,
  promptId: string
) {
  try {
    await db
      .delete(templatesToPromptsTable)
      .where(
        and(
          eq(templatesToPromptsTable.templateId, templateId),
          eq(templatesToPromptsTable.promptId, promptId)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing prompt from template:", error)
    throw error
  }
}

export async function getPromptsForTemplate(templateId: string) {
  try {
    return db.query.templatesToPrompts.findMany({
      where: eq(templatesToPromptsTable.templateId, templateId),
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
    console.error("Error getting prompts for template:", error)
    throw error
  }
}
