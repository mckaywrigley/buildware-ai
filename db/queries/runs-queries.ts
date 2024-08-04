import { eq } from "drizzle-orm"
import { db } from "../db"
import { InsertRun, InsertRunStep, runsTable, runStepsTable } from "../schema/runs-schema"

export async function createRun(data: InsertRun) {
  const [run] = await db.insert(runsTable).values(data).returning()
  return run
}

export async function getRun(id: string) {
  return db.query.runsTable.findFirst({
    where: eq(runsTable.id, id),
    with: {
      steps: true
    }
  })
}

export async function updateRun(id: string, data: Partial<InsertRun>) {
  const [updatedRun] = await db
    .update(runsTable)
    .set(data)
    .where(eq(runsTable.id, id))
    .returning()
  return updatedRun
}

export async function createRunStep(data: InsertRunStep) {
  const [step] = await db.insert(runStepsTable).values(data).returning()
  return step
}

export async function getRunSteps(runId: string) {
  return db.query.runStepsTable.findMany({
    where: eq(runStepsTable.runId, runId),
    orderBy: runStepsTable.createdAt
  })
}

export async function updateRunStep(id: string, data: Partial<InsertRunStep>) {
  const [updatedStep] = await db
    .update(runStepsTable)
    .set(data)
    .where(eq(runStepsTable.id, id))
    .returning()
  return updatedStep
}