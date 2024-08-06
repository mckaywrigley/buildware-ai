"use server"

import { getUserId } from "@/actions/auth/auth"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertRun, SelectRun, runsTable } from "../schema/runs-schema"

export async function createRun(
  data: Omit<InsertRun, "userId">
): Promise<SelectRun> {
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

export async function getRunById(id: string): Promise<SelectRun | undefined> {
  try {
    return await db.query.runs.findFirst({
      where: eq(runsTable.id, id)
    })
  } catch (error) {
    console.error(`Error getting run by id ${id}:`, error)
    throw error
  }
}

export async function getRunsByIssueId(issueId: string): Promise<SelectRun[]> {
  try {
    return await db.query.runs.findMany({
      where: eq(runsTable.issueId, issueId),
      orderBy: desc(runsTable.createdAt)
    })
  } catch (error) {
    console.error("Error getting runs for issue:", error)
    throw error
  }
}

export async function updateRun(
  id: string,
  data: Partial<InsertRun>
): Promise<void> {
  try {
    await db
      .update(runsTable)
      .set(data)
      .where(and(eq(runsTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating run ${id}:`, error)
    throw error
  }
}

export async function deleteRun(id: string): Promise<void> {
  try {
    await db.delete(runsTable).where(and(eq(runsTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting run ${id}:`, error)
    throw error
  }
}