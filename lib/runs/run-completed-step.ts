import { updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runCompletedStep = async ({
  issue,
  setCurrentStep
}: RunStepParams) => {
  try {
    setCurrentStep("completed")
    await updateIssue(issue.id, { status: "completed" })
  } catch (error) {
    console.error("Error running completed step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
