"use server"

import { getUserId } from "@/actions/auth/auth"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertRun, InsertRunStep, runsTable, runStepsTable, SelectRun, SelectRunStep } from "../schema/runs-schema"

export async function createRun(data: Omit<InsertRun, "userId">): Promise<SelectRun> {
  const userId = await getUserId()

  try {
    const [result] = await db
      .insert(runsTable)
      .values({ ...data, userId })
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating run:", error)
    throw error
  }
}

export async function updateRun(id: string, data: Partial<InsertRun>): Promise<SelectRun> {
  try {
    const [result] = await db
      .update(runsTable)
      .set(data)
      .where(eq(runsTable.id, id))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error(`Error updating run ${id}:`, error)
    throw error
  }
}

export async function getRun(id: string): Promise<SelectRun | undefined> {
  try {
    return await db.query.runs.findFirst({
      where: eq(runsTable.id, id),
      with: {
        steps: true
      }
    })
  } catch (error) {
    console.error(`Error getting run ${id}:`, error)
    throw error
  }
}

export async function getRunsByProjectId(projectId: string): Promise<SelectRun[]> {
  try {
    return await db.query.runs.findMany({
      where: eq(runsTable.projectId, projectId),
      orderBy: (runs, { desc }) => [desc(runs.createdAt)],
      with: {
        steps: true
      }
    })
  } catch (error) {
    console.error(`Error getting runs for project ${projectId}:`, error)
    throw error
  }
}

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

export async function updateRunStep(id: string, data: Partial<InsertRunStep>): Promise<SelectRunStep> {
  try {
    const [result] = await db
      .update(runStepsTable)
      .set(data)
      .where(eq(runStepsTable.id, id))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error(`Error updating run step ${id}:`, error)
    throw error
  }
}

export async function getRunSteps(runId: string): Promise<SelectRunStep[]> {
  try {
    return await db.query.runSteps.findMany({
      where: eq(runStepsTable.runId, runId),
      orderBy: (runSteps, { asc }) => [asc(runSteps.createdAt)]
    })
  } catch (error) {
    console.error(`Error getting run steps for run ${runId}:`, error)
    throw error
  }
}