"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertIssueMessage,
  SelectIssueMessage,
  issueMessagesTable
} from "../schema/issue-messages-schema"

export async function createIssueMessageRecord(
  data: InsertIssueMessage
): Promise<SelectIssueMessage> {
  try {
    const [result] = await db
      .insert(issueMessagesTable)
      .values({ ...data })
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating issue message record:", error)
    throw error
  }
}

export async function getIssueMessageById(
  id: string
): Promise<SelectIssueMessage | undefined> {
  try {
    return db.query.issueMessages.findFirst({
      where: eq(issueMessagesTable.id, id)
    })
  } catch (error) {
    console.error(`Error getting issue message by id ${id}:`, error)
    throw error
  }
}

export async function getIssueMessagesByIssueId(
  issueId: string
): Promise<SelectIssueMessage[]> {
  try {
    return db.query.issueMessages.findMany({
      where: eq(issueMessagesTable.issueId, issueId),
      orderBy: desc(issueMessagesTable.createdAt)
    })
  } catch (error) {
    console.error(`Error getting issue messages for issue ${issueId}:`, error)
    throw error
  }
}

export async function updateIssueMessage(
  id: string,
  data: Partial<InsertIssueMessage>
): Promise<void> {
  try {
    await db
      .update(issueMessagesTable)
      .set(data)
      .where(and(eq(issueMessagesTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating issue message ${id}:`, error)
    throw error
  }
}

export async function deleteIssueMessage(id: string): Promise<void> {
  try {
    await db
      .delete(issueMessagesTable)
      .where(and(eq(issueMessagesTable.id, id)))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting issue message ${id}:`, error)
    throw error
  }
}

export async function deleteIssueMessagesByIssueId(
  issueId: string
): Promise<void> {
  try {
    await db
      .delete(issueMessagesTable)
      .where(eq(issueMessagesTable.issueId, issueId))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting issue messages for issue ${issueId}:`, error)
    throw error
  }
}
