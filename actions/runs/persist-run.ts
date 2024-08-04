"use server"

import { createRun, createRunStep, updateRun, updateRunStep } from "@/db/queries/runs-queries"
import { InsertRun, InsertRunStep } from "@/db/schema/runs-schema"
import { StepName } from "@/types/run"

export async function persistRun(runData: Omit<InsertRun, "id" | "createdAt" | "updatedAt">) {
  try {
    const run = await createRun(runData)
    return run
  } catch (error) {
    console.error("Error persisting run:", error)
    throw error
  }
}

export async function persistRunStep(stepData: Omit<InsertRunStep, "id" | "createdAt" | "updatedAt">) {
  try {
    const step = await createRunStep(stepData)
    return step
  } catch (error) {
    console.error("Error persisting run step:", error)
    throw error
  }
}

export async function updateRunStatus(runId: string, status: string, totalCost: number) {
  try {
    const updatedRun = await updateRun(runId, { status, totalCost })
    return updatedRun
  } catch (error) {
    console.error("Error updating run status:", error)
    throw error
  }
}

export async function updateRunStepStatus(stepId: string, status: string, cost: number, response: string) {
  try {
    const updatedStep = await updateRunStep(stepId, { status, cost, response })
    return updatedStep
  } catch (error) {
    console.error("Error updating run step status:", error)
    throw error
  }
}

export async function calculateAndUpdateTotalRunCost(runId: string) {
  try {
    const run = await getRun(runId)
    if (!run) throw new Error("Run not found")

    const totalCost = run.steps.reduce((acc, step) => acc + Number(step.cost), 0)
    await updateRun(runId, { totalCost })
  } catch (error) {
    console.error("Error calculating and updating total run cost:", error)
    throw error
  }
}