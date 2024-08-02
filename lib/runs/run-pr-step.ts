import { generatePR } from "@/actions/github/generate-pr"
import { RunStepParams } from "@/types/run"

export const runPRStep = async ({
  issue,
  project,
  parsedImplementation,
  setPrLink
}: RunStepParams) => {
  try {
    const { prLink } = await generatePR(
      issue.name,
      project,
      parsedImplementation
    )

    setPrLink(prLink || "")
  } catch (error) {
    console.error("Error running PR step:", error)
    throw error
  }
}
