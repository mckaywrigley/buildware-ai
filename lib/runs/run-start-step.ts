import { updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runStartStep = async ({
  issue,
  setCurrentStep
}: RunStepParams) => {
  try {
    setCurrentStep("started")
    await updateIssue(issue.id, { status: "started" })
  } catch (error) {
    console.error("Error running start step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
