"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { templatesToInstructionsTable } from "../schema/templates-to-instructions-schema"

export async function addInstructionToTemplate(
  templateId: string,
  instructionId: string
) {
  try {
    await db
      .insert(templatesToInstructionsTable)
      .values({ templateId, instructionId })
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding instruction to template:", error)
    throw error
  }
}

export async function removeInstructionFromTemplate(
  templateId: string,
  instructionId: string
) {
  try {
    await db
      .delete(templatesToInstructionsTable)
      .where(
        and(
          eq(templatesToInstructionsTable.templateId, templateId),
          eq(templatesToInstructionsTable.instructionId, instructionId)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing instruction from template:", error)
    throw error
  }
}

export async function getInstructionsForTemplate(templateId: string) {
  try {
    return db.query.templatesToInstructions.findMany({
      where: eq(templatesToInstructionsTable.templateId, templateId),
      with: {
        instruction: {
          columns: {
            id: true,
            name: true,
            content: true
          }
        }
      }
    })
  } catch (error) {
    console.error("Error getting instructions for template:", error)
    throw error
  }
}
