"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupsTable } from "@/db/schema/context-groups-schema"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq } from "drizzle-orm"

const updateContextGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional()
})

export async function updateContextGroup(
  contextGroupId: string,
  data: z.infer<typeof updateContextGroupSchema>
) {
  try {
    const userId = await getUserId()
    const validatedData = updateContextGroupSchema.parse(data)

    const [updatedContextGroup] = await db
      .update(contextGroupsTable)
      .set(validatedData)
      .where(eq(contextGroupsTable.id, contextGroupId))
      .returning()

    if (!updatedContextGroup) {
      throw new Error("Context group not found")
    }

    revalidatePath(`/${updatedContextGroup.projectId}/context-groups`)
    return updatedContextGroup
  } catch (error) {
    console.error("Error updating context group:", error)
    throw new Error("Failed to update context group")
  }
}