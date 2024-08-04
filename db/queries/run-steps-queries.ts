"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertRunStep, SelectRunStep, runStepsTable } from "../schema/run-steps-schema"

export async function createRunStep(data: InsertRunStep): Promise<SelectRunStep> {
  try {
    const [result] = await db
      .insert(runStepsTable)
      .values(data)
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating run step:", error)
    throw error
  }
}

export async function getRunStepsByRunId(runId: string): Promise<SelectRunStep[]> {
  try {
    return await db.query.runSteps.findMany({
      where: eq(runStepsTable.runId, runId),
      orderBy: runStepsTable.createdAt
    })
  } catch (error) {
    console.error("Error getting run steps:", error)
    throw error
  }
}

export async function updateRunStep(id: string, data: Partial<InsertRunStep>): Promise<void> {
  try {
    await db
      .update(runStepsTable)
      .set(data)
      .where(and(eq(runStepsTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating run step ${id}:`, error)
    throw error
  }
}

export async function deleteRunStep(id: string): Promise<void> {
  try {
    await db.delete(runStepsTable).where(and(eq(runStepsTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting run step ${id}:`, error)
    throw error
  }
}