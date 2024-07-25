import { createIssueMessage, updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runCompletedStep = async ({
  issue,
  setCurrentStep,
  setMessages
}: RunStepParams) => {
  try {
    setCurrentStep("completed")
    await updateIssue(issue.id, { status: "completed" })
    const completedStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Issue run completed!"
    })
    setMessages(prev => [...prev, completedStatusMessage])
  } catch (error) {
    console.error("Error running completed step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
