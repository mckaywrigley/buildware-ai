"use server"

import { and, eq } from "drizzle-orm"
import { db } from "../db"
import { issuesToContextGroups } from "../schema/issues-to-context-groups-schema"

export async function addContextGroupToIssue(
  issueId: string,
  contextGroupId: string
) {
  try {
    await db.insert(issuesToContextGroups).values({ issueId, contextGroupId })
  } catch (error) {
    console.error("Error adding context group to issue:", error)
    throw error
  }
}

export async function getContextGroupsByIssueId(issueId: string) {
  try {
    return await db.query.issuesToContextGroups.findMany({
      where: eq(issuesToContextGroups.issueId, issueId),
      with: {
        contextGroup: true
      }
    })
  } catch (error) {
    console.error("Error getting context groups for issue:", error)
    throw error
  }
}

export async function removeContextGroupFromIssue(
  issueId: string,
  contextGroupId: string
) {
  try {
    await db
      .delete(issuesToContextGroups)
      .where(
        and(
          eq(issuesToContextGroups.issueId, issueId),
          eq(issuesToContextGroups.contextGroupId, contextGroupId)
        )
      )
  } catch (error) {
    console.error("Error removing context group from issue:", error)
    throw error
  }
}
