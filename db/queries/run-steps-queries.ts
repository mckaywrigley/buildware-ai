"use server"

import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { InsertRunStep, runStepsTable, SelectRunStep } from "../schema/run-steps-schema";

export async function createRunStep(
  data: InsertRunStep
): Promise<SelectRunStep> {
  try {
    const [result] = await db
      .insert(runStepsTable)
      .values(data)
      .returning();
    return result;
  } catch (error) {
    console.error("Error creating run step record:", error);
    throw error;
  }
}

export async function getRunStepsByIssueId(
  issueId: string
): Promise<SelectRunStep[]> {
  try {
    return await db.query.runSteps.findMany({
      where: eq(runStepsTable.issueId, issueId),
    });
  } catch (error) {
    console.error(`Error getting run steps for issue ${issueId}:`, error);
    throw error;
  }
}

export async function updateRunStep(
  id: string,
  data: Partial<InsertRunStep>
): Promise<void> {
  try {
    await db
      .update(runStepsTable)
      .set(data)
      .where(and(eq(runStepsTable.id, id)));
  } catch (error) {
    console.error(`Error updating run step ${id}:`, error);
    throw error;
  }
}

// mckay left a comment haha