"use server"

import { auth } from "@clerk/nextjs/server"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertIssue, SelectIssue, issuesTable } from "../schema/issues-schema"

export async function createIssue(
  data: Omit<InsertIssue, "userId">
): Promise<SelectIssue> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  const [issue] = await db
    .insert(issuesTable)
    .values({ ...data, userId })
    .returning()
  revalidatePath("/")
  return issue
}

export async function getIssuesByProjectId(
  projectId: string
): Promise<SelectIssue[]> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  return db.query.issues.findMany({
    where: and(
      eq(issuesTable.userId, userId),
      eq(issuesTable.projectId, projectId)
    ),
    orderBy: desc(issuesTable.createdAt)
  })
}

export async function getIssueById(
  id: string
): Promise<SelectIssue | undefined> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  return db.query.issues.findFirst({
    where: and(eq(issuesTable.id, id), eq(issuesTable.userId, userId))
  })
}

export async function updateIssue(
  id: string,
  data: Partial<InsertIssue>
): Promise<SelectIssue> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  const [updatedIssue] = await db
    .update(issuesTable)
    .set(data)
    .where(and(eq(issuesTable.id, id), eq(issuesTable.userId, userId)))
    .returning()
  revalidatePath("/")
  return updatedIssue
}

export async function deleteIssue(id: string): Promise<void> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  await db
    .delete(issuesTable)
    .where(and(eq(issuesTable.id, id), eq(issuesTable.userId, userId)))
  revalidatePath("/")
}
