import { updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runVerifyStep = async ({
  issue,
  setCurrentStep
}: RunStepParams) => {
  try {
    setCurrentStep("verify")
    await updateIssue(issue.id, { status: "verify" })

    // Implement verification logic here
    // This could involve running tests, linting, or other checks
  } catch (error) {
    console.error("Error running verify step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
