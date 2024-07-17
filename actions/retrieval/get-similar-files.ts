"use server"

import { generateEmbedding } from "@/actions/ai/generate-embedding"
import { db } from "@/db/db"
import { getProjectById } from "@/db/queries"
import { embeddedBranchesTable } from "@/db/schema"
import { embeddedFilesTable } from "@/db/schema/embedded-files-schema"
import { BUILDWARE_MAX_INPUT_TOKENS } from "@/lib/constants/buildware-config"
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm"

export const getMostSimilarEmbeddedFiles = async (
  text: string,
  projectId: string
) => {
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error("Project not found")
  }

  const embeddedBranch = await db.query.embeddedBranches.findFirst({
    where: and(
      eq(embeddedBranchesTable.projectId, projectId),
      eq(embeddedBranchesTable.branchName, project.githubTargetBranch || "")
    )
  })
  if (!embeddedBranch) {
    throw new Error("Embedded branch not found")
  }

  const embedding = await generateEmbedding(text)

  const similarity = sql<number>`1 - (${cosineDistance(embeddedFilesTable.embedding, embedding)})`

  const mostSimilarEmbeddedFiles = await db
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
      similarity
    })
    .from(embeddedFilesTable)
    .where(
      and(
        gt(similarity, 0.01),
        eq(embeddedFilesTable.embeddedBranchId, embeddedBranch.id)
      )
    )
    .orderBy(t => desc(t.similarity))

  const filteredFiles = mostSimilarEmbeddedFiles.reduce(
    (acc: { files: typeof mostSimilarEmbeddedFiles; tokens: number }, file) => {
      if (acc.tokens + file.tokenCount <= BUILDWARE_MAX_INPUT_TOKENS) {
        acc.files.push(file)
        acc.tokens += file.tokenCount
      }
      return acc
    },
    { files: [], tokens: 0 }
  ).files

  return filteredFiles
}
