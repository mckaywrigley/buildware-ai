import { db } from "../db"
import { eq } from "drizzle-orm"
import { runsTable, runStepsTable, InsertRun, InsertRunStep } from "../schema/runs-schema"

export async function createRun(data: InsertRun) {
  const [run] = await db.insert(runsTable).values(data).returning()
  return run
}

export async function updateRun(id: string, data: Partial<InsertRun>) {
  const [updatedRun] = await db
    .update(runsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(runsTable.id, id))
    .returning()
  return updatedRun
}

export async function createRunStep(data: InsertRunStep) {
  const [step] = await db.insert(runStepsTable).values(data).returning()
  return step
}

export async function updateRunStep(id: string, data: Partial<InsertRunStep>) {
  const [updatedStep] = await db
    .update(runStepsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(runStepsTable.id, id))
    .returning()
  return updatedStep
}

export async function getRunById(id: string) {
  return db.query.runsTable.findFirst({
    where: eq(runsTable.id, id),
    with: {
      steps: true
    }
  })
}

export async function getRunsByProjectId(projectId: string) {
  return db.query.runsTable.findMany({
    where: eq(runsTable.projectId, projectId),
    orderBy: (runs, { desc }) => [desc(runs.createdAt)]
  })
}