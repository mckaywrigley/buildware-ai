"use server"

import { getRunById, updateRun } from "@/db/queries/runs-queries"
import { calculateLLMCost } from "@/lib/ai/calculate-llm-cost"
import { StepName } from "@/types/run"
import { updateRunStep } from "../runs/manage-runs"

export const calculateAndStoreCost = async (
  runId: string,
  stepName: StepName,
  llmId: string,
  inputTokens: number,
  outputTokens: number
) => {
  const cost = calculateLLMCost({ llmId, inputTokens, outputTokens })

  await updateRunStep(runId, stepName, "completed", cost.toString())

  const run = await getRunById(runId)
  if (run) {
    const newTotalCost = parseFloat(run.totalCost) + cost
    await updateRun(runId, { totalCost: newTotalCost.toString() })
  }

  return cost
}
