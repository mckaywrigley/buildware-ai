"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupFilesTable } from "@/db/schema/context-group-files-schema"
import { eq } from "drizzle-orm"

export async function getFilesInContextGroup(contextGroupId: string) {
  try {
    const userId = await getUserId()
    const files = await db.query.contextGroupFiles.findMany({
      where: eq(contextGroupFilesTable.contextGroupId, contextGroupId),
      orderBy: contextGroupFilesTable.createdAt
    })
    return files
  } catch (error) {
    console.error("Error fetching files in context group:", error)
    throw new Error("Failed to fetch files in context group")
  }
}