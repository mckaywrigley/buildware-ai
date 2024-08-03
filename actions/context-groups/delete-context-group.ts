"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupsTable } from "@/db/schema/context-groups-schema"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

export async function deleteContextGroup(contextGroupId: string) {
  try {
    const userId = await getUserId()
    const [deletedContextGroup] = await db
      .delete(contextGroupsTable)
      .where(eq(contextGroupsTable.id, contextGroupId))
      .returning()

    if (!deletedContextGroup) {
      throw new Error("Context group not found")
    }

    revalidatePath(`/${deletedContextGroup.projectId}/context-groups`)
    return deletedContextGroup
  } catch (error) {
    console.error("Error deleting context group:", error)
    throw new Error("Failed to delete context group")
  }
}