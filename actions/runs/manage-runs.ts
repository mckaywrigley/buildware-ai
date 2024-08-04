"use server"

import { createRun, getRunById, getRunsByIssueId, updateRun } from "@/db/queries/runs-queries"
import { createRunStep, getRunStepsByRunId, updateRunStep } from "@/db/queries/run-steps-queries"
import { SelectRun } from "@/db/schema/runs-schema"
import { SelectRunStep } from "@/db/schema/run-steps-schema"
import { StepName } from "@/types/run"

export async function startNewRun(issueId: string): Promise<SelectRun> {
  try {
    const run = await createRun({ issueId, status: "in_progress" })
    return run
  } catch (error) {
    console.error("Error starting new run:", error)
    throw error
  }
}

export async function updateRunStep(
  runId: string,
  stepName: StepName,
  status: string,
  cost: string,
  content?: string
): Promise<SelectRunStep> {
  try {
    const existingSteps = await getRunStepsByRunId(runId)
    const existingStep = existingSteps.find(step => step.stepName === stepName)

    if (existingStep) {
      await updateRunStep(existingStep.id, { status, cost, content })
      return { ...existingStep, status, cost, content } as SelectRunStep
    } else {
      const newStep = await createRunStep({ runId, stepName, status, cost, content })
      return newStep
    }
  } catch (error) {
    console.error("Error updating run step:", error)
    throw error
  }
}

export async function updateRunStatus(runId: string, status: string, totalCost: string): Promise<void> {
  try {
    await updateRun(runId, { status, totalCost })
  } catch (error) {
    console.error("Error updating run status:", error)
    throw error
  }
}

export async function getRunWithSteps(runId: string): Promise<SelectRun & { steps: SelectRunStep[] }> {
  try {
    const run = await getRunById(runId)
    if (!run) {
      throw new Error("Run not found")
    }
    const steps = await getRunStepsByRunId(runId)
    return { ...run, steps }
  } catch (error) {
    console.error("Error getting run with steps:", error)
    throw error
  }
}

export async function getRunHistory(issueId: string): Promise<(SelectRun & { steps: SelectRunStep[] })[]> {
  try {
    const runs = await getRunsByIssueId(issueId)
    const runsWithSteps = await Promise.all(
      runs.map(async run => {
        const steps = await getRunStepsByRunId(run.id)
        return { ...run, steps }
      })
    )
    return runsWithSteps
  } catch (error) {
    console.error("Error getting run history:", error)
    throw error
  }
}