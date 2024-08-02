"use server"

import { getUserId } from "@/actions/auth/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertContextGroup,
  SelectContextGroup,
  contextGroups
} from "../schema/context-groups-schema"

export async function createContextGroup(
  data: Omit<InsertContextGroup, "userId">
): Promise<SelectContextGroup> {
  const userId = await getUserId()

  try {
    const [result] = await db
      .insert(contextGroups)
      .values({ ...data, userId })
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating context group:", error)
    throw error
  }
}

export async function getContextGroupById(
  id: string
): Promise<SelectContextGroup | undefined> {
  try {
    return await db.query.contextGroups.findFirst({
      where: eq(contextGroups.id, id)
    })
  } catch (error) {
    console.error(`Error getting context group by id ${id}:`, error)
    throw error
  }
}

export async function getContextGroupsByProjectId(
  projectId: string
): Promise<SelectContextGroup[]> {
  try {
    return await db.query.contextGroups.findMany({
      where: eq(contextGroups.projectId, projectId),
      orderBy: (contextGroups, { desc }) => [desc(contextGroups.updatedAt)]
    })
  } catch (error) {
    console.error("Error getting context groups for project:", error)
    throw error
  }
}

export async function updateContextGroup(
  id: string,
  data: Partial<InsertContextGroup>
): Promise<void> {
  try {
    await db.update(contextGroups).set(data).where(eq(contextGroups.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating context group ${id}:`, error)
    throw error
  }
}

export async function deleteContextGroup(id: string): Promise<void> {
  try {
    await db.delete(contextGroups).where(eq(contextGroups.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting context group ${id}:`, error)
    throw error
  }
}
