"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "@/db/db"
import { contextGroupsTable } from "@/db/schema/context-groups-schema"
import { eq } from "drizzle-orm"

export async function getContextGroups(projectId: string) {
  try {
    const userId = await getUserId()
    const contextGroups = await db.query.contextGroups.findMany({
      where: eq(contextGroupsTable.projectId, projectId),
      orderBy: contextGroupsTable.createdAt
    })
    return contextGroups
  } catch (error) {
    console.error("Error fetching context groups:", error)
    throw new Error("Failed to fetch context groups")
  }
}