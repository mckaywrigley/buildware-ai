"use server"

import { getUserId } from "@/actions/auth/auth"
import { db } from "../db"
import { InsertFeedback, SelectFeedback, feedbackTable } from "../schema/feedback-schema"
import { desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createFeedback(data: Omit<InsertFeedback, "userId">): Promise<SelectFeedback> {
  const userId = await getUserId()

  try {
    const [result] = await db
      .insert(feedbackTable)
      .values({ ...data, userId })
      .returning()
    revalidatePath("/feedback")
    return result
  } catch (error) {
    console.error("Error creating feedback record:", error)
    throw error
  }
}

export async function getFeedback(): Promise<SelectFeedback[]> {
  try {
    return db.query.feedback.findMany({
      orderBy: desc(feedbackTable.createdAt)
    })
  } catch (error) {
    console.error("Error getting feedback:", error)
    throw error
  }
}