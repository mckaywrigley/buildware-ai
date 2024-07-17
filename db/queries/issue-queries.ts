"use server"

import { getUserId } from "@/actions/auth/auth"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import { InsertIssue, SelectIssue, issuesTable } from "../schema/issues-schema"

export async function createIssue(
  data: Omit<InsertIssue, "userId">
): Promise<SelectIssue> {
  const userId = await getUserId()

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
  return db.query.issues.findMany({
    where: and(eq(issuesTable.projectId, projectId)),
    orderBy: desc(issuesTable.createdAt)
  })
}

export async function getIssueById(
  id: string
): Promise<SelectIssue | undefined> {
  return db.query.issues.findFirst({
    where: eq(issuesTable.id, id)
  })
}

export async function updateIssue(
  id: string,
  data: Partial<InsertIssue>
): Promise<SelectIssue> {
  const [updatedIssue] = await db
    .update(issuesTable)
    .set(data)
    .where(eq(issuesTable.id, id))
    .returning()
  revalidatePath("/")
  return updatedIssue
}

export async function deleteIssue(id: string): Promise<void> {
  await db.delete(issuesTable).where(eq(issuesTable.id, id))
  revalidatePath("/")
}
