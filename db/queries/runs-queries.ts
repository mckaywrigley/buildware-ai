import { db } from "@/db/db"
import { runsTable, runStepsTable, InsertRun, InsertRunStep, SelectRun, SelectRunStep } from "@/db/schema/runs-schema"
import { and, desc, eq } from "drizzle-orm"

export async function createRun(issueId: string): Promise<SelectRun> {
  const [run] = await db.insert(runsTable).values({ issueId }).returning()
  return run
}

export async function updateRunStatus(runId: string, status: string): Promise<void> {
  await db.update(runsTable).set({ status }).where(eq(runsTable.id, runId))
}

export async function createRunStep(runId: string, stepName: string): Promise<SelectRunStep> {
  const [step] = await db.insert(runStepsTable).values({ runId, stepName }).returning()
  return step
}

export async function updateRunStep(stepId: string, data: Partial<InsertRunStep>): Promise<void> {
  await db.update(runStepsTable).set(data).where(eq(runStepsTable.id, stepId))
}

export async function updateRunTotalCost(runId: string, totalCost: number): Promise<void> {
  await db.update(runsTable).set({ totalCost }).where(eq(runsTable.id, runId))
}

export async function getRunWithSteps(runId: string): Promise<SelectRun & { steps: SelectRunStep[] }> {
  const run = await db.query.runs.findFirst({
    where: eq(runsTable.id, runId),
    with: {
      steps: true
    }
  })
  return run as SelectRun & { steps: SelectRunStep[] }
}

export async function getLastIncompleteRun(issueId: string): Promise<SelectRun | undefined> {
  return db.query.runs.findFirst({
    where: and(
      eq(runsTable.issueId, issueId),
      eq(runsTable.status, "in_progress")
    ),
    orderBy: [desc(runsTable.createdAt)]
  })
}

export async function getRunsForIssue(issueId: string): Promise<SelectRun[]> {
  return db.query.runs.findMany({
    where: eq(runsTable.issueId, issueId),
    orderBy: [desc(runsTable.createdAt)]
  })
}

export async function createRunWithFirstStep(issueId: string, stepName: string): Promise<{ run: SelectRun, step: SelectRunStep }> {
  return db.transaction(async (tx) => {
    try {
      const [run] = await tx.insert(runsTable).values({ issueId }).returning()
      const [step] = await tx.insert(runStepsTable).values({ runId: run.id, stepName }).returning()
      return { run, step }
    } catch (error) {
      console.error("Error creating run with first step:", error)
      throw error
    }
  })
}