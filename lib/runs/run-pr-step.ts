import { generatePR } from "@/actions/github/generate-pr"
import { SelectIssue, SelectProject } from "@/db/schema"
import { ParsedImplementation } from "@/types/run"
import { updateRunStep } from "@/actions/runs/manage-runs"
import { calculateAndStoreCost } from "@/actions/ai/calculate-llm-cost"

export const runPRStep = async ({
  runId,
  issue,
  project,
  parsedImplementation
}: {
  runId: string,
  issue: SelectIssue
  project: SelectProject
  parsedImplementation: ParsedImplementation
}) => {
  try {
    const { prLink } = await generatePR(
      issue.name,
      project,
      parsedImplementation
    )

    const cost = await calculateAndStoreCost(runId, "pr", "dummy-llm-id", 0, 0)
    await updateRunStep(runId, "pr", "completed", cost.toString(), prLink || "")

    return {
      prLink: prLink || ""
    }
  } catch (error) {
    console.error("Error running PR step:", error)
    throw error
  }
}