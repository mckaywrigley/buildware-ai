import { generatePR } from "@/actions/github/generate-pr"
import { createIssueMessage, updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runPRStep = async ({
  issue,
  project,
  parsedActResponse,
  setCurrentStep,
  setMessages
}: RunStepParams) => {
  if (!parsedActResponse) {
    throw new Error("Parsed act response is required for PR step")
  }

  try {
    setCurrentStep("pr")
    await updateIssue(issue.id, { status: "pr" })
    const prStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Creating pull request..."
    })
    setMessages(prev => [...prev, prStatusMessage])

    const { prLink, branchName } = await generatePR(
      issue.name,
      project,
      parsedActResponse
    )

    const prCreatedMessage = await createIssueMessage({
      issueId: issue.id,
      content: `Pull request created successfully!\n\nBranch: ${branchName}\nPR Link: ${prLink}`
    })
    setMessages(prev => [...prev, prCreatedMessage])

    // Update issue with PR link
    await updateIssue(issue.id, { prLink })
  } catch (error) {
    console.error("Error running PR step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
