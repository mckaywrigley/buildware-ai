"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { contextGroupsToEmbeddedFiles } from "../schema/context-groups-to-embedded-files-schema"

export async function addEmbeddedFileToContextGroup(
  contextGroupId: string,
  embeddedFileId: string
) {
  try {
    await db
      .insert(contextGroupsToEmbeddedFiles)
      .values({ contextGroupId, embeddedFileId })
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding embedded file to context group:", error)
    throw error
  }
}

export async function removeEmbeddedFileFromContextGroup(
  contextGroupId: string,
  embeddedFileId: string
) {
  try {
    await db
      .delete(contextGroupsToEmbeddedFiles)
      .where(
        and(
          eq(contextGroupsToEmbeddedFiles.contextGroupId, contextGroupId),
          eq(contextGroupsToEmbeddedFiles.embeddedFileId, embeddedFileId)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing embedded file from context group:", error)
    throw error
  }
}

export async function getEmbeddedFilesForContextGroup(contextGroupId: string) {
  try {
    return db.query.contextGroupsToEmbeddedFiles.findMany({
      where: eq(contextGroupsToEmbeddedFiles.contextGroupId, contextGroupId),
      with: {
        embeddedFile: true
      }
    })
  } catch (error) {
    console.error("Error getting embedded files for context group:", error)
    throw error
  }
}

export async function getContextGroupsForEmbeddedFile(embeddedFileId: string) {
  try {
    return db.query.contextGroupsToEmbeddedFiles.findMany({
      where: eq(contextGroupsToEmbeddedFiles.embeddedFileId, embeddedFileId),
      with: {
        contextGroup: true
      }
    })
  } catch (error) {
    console.error("Error getting context groups for embedded file:", error)
    throw error
  }
}
