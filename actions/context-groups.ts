"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupFilesTable, contextGroupsTable } from "@/db/schema"
import { InsertContextGroup, InsertContextGroupFile } from "@/db/schema/context-groups-schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createContextGroup(data: Omit<InsertContextGroup, "userId">): Promise<{ id: string }> {
  const userId = await getUserId()

  try {
    const [result] = await db
      .insert(contextGroupsTable)
      .values({ ...data, userId })
      .returning({ id: contextGroupsTable.id })
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating context group:", error)
    throw new Error("Failed to create context group")
  }
}

export async function getContextGroups(projectId: string) {
  const userId = await getUserId()

  try {
    return await db.query.contextGroupsTable.findMany({
      where: and(
        eq(contextGroupsTable.userId, userId),
        eq(contextGroupsTable.projectId, projectId)
      ),
      orderBy: [contextGroupsTable.createdAt]
    })
  } catch (error) {
    console.error("Error fetching context groups:", error)
    throw new Error("Failed to fetch context groups")
  }
}

export async function getContextGroup(id: string) {
  const userId = await getUserId()

  try {
    return await db.query.contextGroupsTable.findFirst({
      where: and(
        eq(contextGroupsTable.id, id),
        eq(contextGroupsTable.userId, userId)
      ),
      with: {
        files: true
      }
    })
  } catch (error) {
    console.error("Error fetching context group:", error)
    throw new Error("Failed to fetch context group")
  }
}

export async function updateContextGroup(id: string, data: Partial<InsertContextGroup>) {
  const userId = await getUserId()

  try {
    await db
      .update(contextGroupsTable)
      .set(data)
      .where(and(
        eq(contextGroupsTable.id, id),
        eq(contextGroupsTable.userId, userId)
      ))
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating context group:", error)
    throw new Error("Failed to update context group")
  }
}

export async function deleteContextGroup(id: string) {
  const userId = await getUserId()

  try {
    await db
      .delete(contextGroupsTable)
      .where(and(
        eq(contextGroupsTable.id, id),
        eq(contextGroupsTable.userId, userId)
      ))
    revalidatePath("/")
  } catch (error) {
    console.error("Error deleting context group:", error)
    throw new Error("Failed to delete context group")
  }
}

export async function addFileToContextGroup(data: Omit<InsertContextGroupFile, "id">) {
  try {
    await db.insert(contextGroupFilesTable).values(data)
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding file to context group:", error)
    throw new Error("Failed to add file to context group")
  }
}

export async function removeFileFromContextGroup(contextGroupId: string, filePath: string) {
  try {
    await db
      .delete(contextGroupFilesTable)
      .where(and(
        eq(contextGroupFilesTable.contextGroupId, contextGroupId),
        eq(contextGroupFilesTable.filePath, filePath)
      ))
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing file from context group:", error)
    throw new Error("Failed to remove file from context group")
  }
}

export async function getFilesInContextGroup(contextGroupId: string) {
  try {
    return await db.query.contextGroupFilesTable.findMany({
      where: eq(contextGroupFilesTable.contextGroupId, contextGroupId),
      orderBy: [contextGroupFilesTable.createdAt]
    })
  } catch (error) {
    console.error("Error fetching files in context group:", error)
    throw new Error("Failed to fetch files in context group")
  }
}