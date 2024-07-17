"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { issuesToInstructionsTable } from "../schema/issues-to-instructions-schema"

export async function addInstructionToIssue(
  issueId: string,
  instructionId: string
) {
  try {
    await db
      .insert(issuesToInstructionsTable)
      .values({ issueId, instructionId })
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding instruction to issue:", error)
    throw error
  }
}

export async function removeInstructionFromIssue(
  issueId: string,
  instructionId: string
) {
  try {
    await db
      .delete(issuesToInstructionsTable)
      .where(
        and(
          eq(issuesToInstructionsTable.issueId, issueId),
          eq(issuesToInstructionsTable.instructionId, instructionId)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing instruction from issue:", error)
    throw error
  }
}

export async function getInstructionsForIssue(issueId: string) {
  try {
    return db.query.issuesToInstructions.findMany({
      where: eq(issuesToInstructionsTable.issueId, issueId),
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
    console.error("Error getting instructions for issue:", error)
    throw error
  }
}
