"use server"

import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { embeddedFilesTable } from "../schema"
import { contextGroupsToEmbeddedFiles } from "../schema/context-groups-to-embedded-files-schema"

export async function addEmbeddedFilesToContextGroup(
  contextGroupId: string,
  embeddedFileIds: string[]
) {
  try {
    if (embeddedFileIds.length === 0) return
    await db.insert(contextGroupsToEmbeddedFiles).values(
      embeddedFileIds.map(embeddedFileId => ({
        contextGroupId,
        embeddedFileId
      }))
    )
    revalidatePath("/")
  } catch (error) {
    console.error("Error adding embedded files to context group:", error)
    throw error
  }
}

export async function removeEmbeddedFilesFromContextGroup(
  contextGroupId: string,
  embeddedFileIds: string[]
) {
  try {
    if (embeddedFileIds.length === 0) return
    await db
      .delete(contextGroupsToEmbeddedFiles)
      .where(
        and(
          eq(contextGroupsToEmbeddedFiles.contextGroupId, contextGroupId),
          inArray(contextGroupsToEmbeddedFiles.embeddedFileId, embeddedFileIds)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error removing embedded files from context group:", error)
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

export async function getFilesByContextGroupIds(contextGroupIds: string[]) {
  try {
    if (contextGroupIds.length === 0) {
      return []
    }

    return db
      .select({
        id: embeddedFilesTable.id,
        projectId: embeddedFilesTable.projectId,
        embeddedBranchId: embeddedFilesTable.embeddedBranchId,
        githubRepoFullName: embeddedFilesTable.githubRepoFullName,
        path: embeddedFilesTable.path,
        content: embeddedFilesTable.content,
        tokenCount: embeddedFilesTable.tokenCount,
        createdAt: embeddedFilesTable.createdAt,
        updatedAt: embeddedFilesTable.updatedAt,
        contextGroupId: contextGroupsToEmbeddedFiles.contextGroupId
      })
      .from(embeddedFilesTable)
      .innerJoin(
        contextGroupsToEmbeddedFiles,
        eq(contextGroupsToEmbeddedFiles.embeddedFileId, embeddedFilesTable.id)
      )
      .where(
        inArray(contextGroupsToEmbeddedFiles.contextGroupId, contextGroupIds)
      )
  } catch (error) {
    console.error("Error getting files for context groups:", error)
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
