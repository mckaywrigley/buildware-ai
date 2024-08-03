"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupFilesTable } from "@/db/schema/context-group-files-schema"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const addFileSchema = z.object({
  contextGroupId: z.string().uuid(),
  filePath: z.string().min(1)
})

export async function addFileToContextGroup(data: z.infer<typeof addFileSchema>) {
  try {
    const userId = await getUserId()
    const validatedData = addFileSchema.parse(data)

    const [addedFile] = await db
      .insert(contextGroupFilesTable)
      .values(validatedData)
      .returning()

    revalidatePath(`/${addedFile.contextGroupId}`)
    return addedFile
  } catch (error) {
    console.error("Error adding file to context group:", error)
    throw new Error("Failed to add file to context group")
  }
}