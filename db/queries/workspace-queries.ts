"use server"

import { getUserId } from "@/actions/auth/auth"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertWorkspace,
  SelectWorkspace,
  workspacesTable
} from "../schema/workspaces-schema"

export async function createWorkspace(
  data: Omit<InsertWorkspace, "userId">
): Promise<SelectWorkspace> {
  const userId = await getUserId()

  try {
    const [result] = await db
      .insert(workspacesTable)
      .values({ ...data, userId })
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating workspace record:", error)
    throw error
  }
}

export async function getWorkspaceById(
  id: string
): Promise<SelectWorkspace | undefined> {
  try {
    return await db.query.workspaces.findFirst({
      where: eq(workspacesTable.id, id)
    })
  } catch (error) {
    console.error(`Error getting workspace by id ${id}:`, error)
    throw error
  }
}

export async function getWorkspacesByUserId(): Promise<SelectWorkspace[]> {
  const userId = await getUserId()

  try {
    return await db.query.workspaces.findMany({
      where: eq(workspacesTable.userId, userId),
      orderBy: desc(workspacesTable.createdAt)
    })
  } catch (error) {
    console.error("Error getting all workspaces:", error)
    throw error
  }
}

export async function getWorkspaceByLinearOrganizationId(
  linearOrganizationId: string
): Promise<SelectWorkspace | undefined> {
  return db.query.workspaces.findFirst({
    where: eq(workspacesTable.linearOrganizationId, linearOrganizationId)
  })
}

export async function updateWorkspace(
  id: string,
  data: Partial<InsertWorkspace>
): Promise<void> {
  try {
    await db
      .update(workspacesTable)
      .set(data)
      .where(and(eq(workspacesTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating workspace ${id}:`, error)
    throw error
  }
}

export async function deleteWorkspace(id: string): Promise<void> {
  try {
    await db.delete(workspacesTable).where(and(eq(workspacesTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting workspace ${id}:`, error)
    throw error
  }
}
