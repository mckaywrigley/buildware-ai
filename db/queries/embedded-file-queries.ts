"use server"

import { getUserId } from "@/actions/auth/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertEmbeddedFile,
  embeddedFilesTable
} from "../schema/embedded-files-schema"

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
