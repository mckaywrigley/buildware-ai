"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupsTable, InsertContextGroup } from "@/db/schema/context-groups-schema"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createContextGroupSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
})

export async function createContextGroup(data: z.infer<typeof createContextGroupSchema>) {
  try {
    const userId = await getUserId()
    const validatedData = createContextGroupSchema.parse(data)

    const [contextGroup] = await db
      .insert(contextGroupsTable)
      .values({ ...validatedData, userId })
      .returning()

    revalidatePath(`/${validatedData.projectId}/context-groups`)
    return contextGroup
  } catch (error) {
    console.error("Error creating context group:", error)
    throw new Error("Failed to create context group")
  }
}