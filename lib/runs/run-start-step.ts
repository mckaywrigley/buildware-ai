import {
  createIssueMessage,
  deleteIssueMessagesByIssueId,
  updateIssue
} from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runStartStep = async ({
  issue,
  setCurrentStep,
  setMessages
}: RunStepParams) => {
  try {
    // RESET RUN
    await deleteIssueMessagesByIssueId(issue.id)
    setMessages([])

    // START
    setCurrentStep("started")
    await updateIssue(issue.id, { status: "started" })
    const startedMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Issue run started."
    })
    setMessages(prev => [...prev, startedMessage])
  } catch (error) {
    console.error("Error running start step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
