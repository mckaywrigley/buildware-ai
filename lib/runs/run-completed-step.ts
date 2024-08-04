import { updateRunStep } from "@/actions/runs/manage-runs"
import { calculateAndStoreCost } from "@/actions/ai/calculate-llm-cost"

export const runCompletedStep = async (runId: string) => {
  try {
    const cost = await calculateAndStoreCost(runId, "completed", "dummy-llm-id", 0, 0)
    await updateRunStep(runId, "completed", "completed", cost.toString())
  } catch (error) {
    console.error("Error running completed step:", error)
    throw error
  }
}