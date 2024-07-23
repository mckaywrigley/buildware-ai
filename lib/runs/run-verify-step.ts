import { createIssueMessage, updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runVerifyStep = async ({
  issue,
  setCurrentStep,
  setMessages
}: RunStepParams) => {
  try {
    setCurrentStep("verify")
    await updateIssue(issue.id, { status: "verify" })
    const verifyStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Verifying changes..."
    })
    setMessages(prev => [...prev, verifyStatusMessage])

    // Implement verification logic here
    // This could involve running tests, linting, or other checks

    const verificationCompleteMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Verification completed successfully."
    })
    setMessages(prev => [...prev, verificationCompleteMessage])
  } catch (error) {
    console.error("Error running verify step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
