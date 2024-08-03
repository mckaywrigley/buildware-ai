"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupsTable } from "@/db/schema/context-groups-schema"
import { eq } from "drizzle-orm"

export async function getContextGroup(contextGroupId: string) {
  try {
    const userId = await getUserId()
    const contextGroup = await db.query.contextGroups.findFirst({
      where: eq(contextGroupsTable.id, contextGroupId),
      with: {
        files: true
      }
    })

    if (!contextGroup) {
      throw new Error("Context group not found")
    }

    return contextGroup
  } catch (error) {
    console.error("Error fetching context group:", error)
    throw new Error("Failed to fetch context group")
  }
}