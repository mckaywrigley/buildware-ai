"use server"

import { getUserId } from "@/actions/auth/auth"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertEmbeddedFile,
  embeddedFilesTable
} from "../schema/embedded-files-schema"

export async function getEmbeddedFilesAndFolders(projectId: string) {
  const files = await db.query.embeddedFiles.findMany({
    where: eq(embeddedFilesTable.projectId, projectId),
    columns: {
      id: true,
      path: true
    }
  })

  const fileSet = new Set(files.map(file => file.path))
  const folderSet = new Set<string>()

  files.forEach(file => {
    const parts = file.path.split("/")
    for (let i = 1; i < parts.length; i++) {
      const folderPath = parts.slice(0, i).join("/")
      if (!fileSet.has(folderPath)) {
        folderSet.add(folderPath)
      }
    }
  })

  const folders = Array.from(folderSet).map(path => ({
    id: `folder_${path}`,
    path,
    type: "folder" as const
  }))

  const result = [
    ...files.map(file => ({ ...file, type: "file" as const })),
    ...folders
  ].sort((a, b) => a.path.localeCompare(b.path))

  return result
}

export async function createEmbeddedFiles(
  data: Omit<InsertEmbeddedFile, "userId">[]
) {
  const userId = await getUserId()

  try {
    await db.insert(embeddedFilesTable).values(
      data.map(file => ({
        ...file,
        userId
      }))
    )
    revalidatePath("/")
  } catch (error) {
    console.error("Error inserting records into embedded_files:", error)
    throw error
  }
}

export async function deleteAllEmbeddedFilesByEmbeddedBranchId(
  embeddedBranchId: string
) {
  try {
    await db
      .delete(embeddedFilesTable)
      .where(eq(embeddedFilesTable.embeddedBranchId, embeddedBranchId))
    revalidatePath("/")
  } catch (error) {
    console.error("Error deleting records from embedded_files:", error)
    throw error
  }
}

export async function deleteEmbeddedFile(
  embeddedBranchId: string,
  path: string
) {
  try {
    await db
      .delete(embeddedFilesTable)
      .where(
        and(
          eq(embeddedFilesTable.embeddedBranchId, embeddedBranchId),
          eq(embeddedFilesTable.path, path)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error deleting embedded file:", error)
    throw error
  }
}

export async function createEmbeddedFile(
  data: Omit<InsertEmbeddedFile, "userId">
) {
  const userId = await getUserId()

  try {
    await db.insert(embeddedFilesTable).values({ ...data, userId })
    revalidatePath("/")
  } catch (error) {
    console.error("Error creating embedded file:", error)
    throw error
  }
}

export async function updateEmbeddedFile(
  data: Omit<InsertEmbeddedFile, "userId">
) {
  try {
    await db
      .update(embeddedFilesTable)
      .set({
        content: data.content,
        tokenCount: data.tokenCount,
        embedding: data.embedding,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(embeddedFilesTable.embeddedBranchId, data.embeddedBranchId),
          eq(embeddedFilesTable.path, data.path)
        )
      )
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating embedded file:", error)
    throw error
  }
}
