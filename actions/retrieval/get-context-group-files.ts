"use server"

import { db } from "@/db/db"
import {
  contextGroups,
  contextGroupsToEmbeddedFiles,
  embeddedFilesTable
} from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export const getContextGroupFiles = async (projectId: string) => {
  const contextGroupIds = await db
    .select({ id: contextGroups.id })
    .from(contextGroups)
    .where(eq(contextGroups.projectId, projectId))

  if (contextGroupIds.length === 0) {
    return []
  }

  const files = await db
    .select({
      id: embeddedFilesTable.id,
      projectId: embeddedFilesTable.projectId,
      embeddedBranchId: embeddedFilesTable.embeddedBranchId,
      githubRepoFullName: embeddedFilesTable.githubRepoFullName,
      path: embeddedFilesTable.path,
      content: embeddedFilesTable.content,
      tokenCount: embeddedFilesTable.tokenCount,
      createdAt: embeddedFilesTable.createdAt,
      updatedAt: embeddedFilesTable.updatedAt
    })
    .from(embeddedFilesTable)
    .innerJoin(
      contextGroupsToEmbeddedFiles,
      eq(contextGroupsToEmbeddedFiles.embeddedFileId, embeddedFilesTable.id)
    )
    .where(
      inArray(
        contextGroupsToEmbeddedFiles.contextGroupId,
        contextGroupIds.map(cg => cg.id)
      )
    )

  return files
}
