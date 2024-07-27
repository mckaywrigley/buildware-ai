import { generatePR } from "@/actions/github/generate-pr"
import { updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runPRStep = async ({
  issue,
  project,
  parsedActResponse,
  setCurrentStep
}: RunStepParams) => {
  if (!parsedActResponse) {
    throw new Error("Parsed act response is required for PR step")
  }

  try {
    setCurrentStep("pr")
    await updateIssue(issue.id, { status: "pr" })

    const { prLink } = await generatePR(issue.name, project, parsedActResponse)

    // Update issue with PR link
    await updateIssue(issue.id, { prLink })
  } catch (error) {
    console.error("Error running PR step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
