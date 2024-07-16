"use server"

import { getUserId } from "@/lib/actions/auth/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertPrompt,
  SelectPrompt,
  promptsTable
} from "../schema/prompts-schema"

export async function createPromptRecords(
  data: Omit<InsertPrompt, "userId">[]
): Promise<SelectPrompt[]> {
  const userId = await getUserId()

  try {
    const result = await db
      .insert(promptsTable)
      .values(data.map(prompt => ({ ...prompt, userId })))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating prompt records:", error)
    throw error
  }
}

export async function getPromptById(
  id: string
): Promise<SelectPrompt | undefined> {
  try {
    const result = await db.query.prompts.findFirst({
      where: eq(promptsTable.id, id)
    })
    return result
  } catch (error) {
    console.error(`Error getting prompt by id ${id}:`, error)
    throw error
  }
}

export async function getPromptsByProjectId(
  projectId: string
): Promise<SelectPrompt[]> {
  return db.query.prompts.findMany({
    where: eq(promptsTable.projectId, projectId)
  })
}

export async function updatePrompt(
  id: string,
  data: Partial<InsertPrompt>
): Promise<void> {
  try {
    await db.update(promptsTable).set(data).where(eq(promptsTable.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating prompt ${id}:`, error)
    throw error
  }
}

export async function deletePrompt(id: string): Promise<void> {
  try {
    await db.delete(promptsTable).where(eq(promptsTable.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting prompt ${id}:`, error)
    throw error
  }
}
