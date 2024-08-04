import { updateRunStep } from "@/actions/runs/manage-runs"
import { calculateAndStoreCost } from "@/actions/ai/calculate-llm-cost"

export const runStartStep = async (runId: string) => {
  try {
    const cost = await calculateAndStoreCost(runId, "started", "dummy-llm-id", 0, 0)
    await updateRunStep(runId, "started", "completed", cost.toString())
  } catch (error) {
    console.error("Error running start step:", error)
    throw error
  }
}