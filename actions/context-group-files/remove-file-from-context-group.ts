"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupFilesTable } from "@/db/schema/context-group-files-schema"
import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

export async function removeFileFromContextGroup(contextGroupId: string, filePath: string) {
  try {
    const userId = await getUserId()
    const [removedFile] = await db
      .delete(contextGroupFilesTable)
      .where(
        and(
          eq(contextGroupFilesTable.contextGroupId, contextGroupId),
          eq(contextGroupFilesTable.filePath, filePath)
        )
      )
      .returning()

    if (!removedFile) {
      throw new Error("File not found in context group")
    }

    revalidatePath(`/${contextGroupId}`)
    return removedFile
  } catch (error) {
    console.error("Error removing file from context group:", error)
    throw new Error("Failed to remove file from context group")
  }
}