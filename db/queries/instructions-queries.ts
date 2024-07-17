"use server"

import { getUserId } from "@/actions/auth/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertInstruction,
  SelectInstruction,
  instructionsTable
} from "../schema/instructions-schema"

export async function createInstructionRecords(
  data: Omit<InsertInstruction, "userId">[]
): Promise<SelectInstruction[]> {
  const userId = await getUserId()

  try {
    const result = await db
      .insert(instructionsTable)
      .values(data.map(instruction => ({ ...instruction, userId })))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating instruction records:", error)
    throw error
  }
}

export async function getInstructionById(
  id: string
): Promise<SelectInstruction | undefined> {
  try {
    const result = await db.query.instructions.findFirst({
      where: eq(instructionsTable.id, id)
    })
    return result
  } catch (error) {
    console.error(`Error getting instruction by id ${id}:`, error)
    throw error
  }
}

export async function getInstructionsByProjectId(
  projectId: string
): Promise<SelectInstruction[]> {
  return db.query.instructions.findMany({
    where: eq(instructionsTable.projectId, projectId)
  })
}

export async function updateInstruction(
  id: string,
  data: Partial<InsertInstruction>
): Promise<void> {
  try {
    await db
      .update(instructionsTable)
      .set(data)
      .where(eq(instructionsTable.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating instruction ${id}:`, error)
    throw error
  }
}

export async function deleteInstruction(id: string): Promise<void> {
  try {
    await db.delete(instructionsTable).where(eq(instructionsTable.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting instruction ${id}:`, error)
    throw error
  }
}
