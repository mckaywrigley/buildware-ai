import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { createIssueMessage, updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runRetrievalStep = async ({
  issue,
  project,
  attachedInstructions,
  setCurrentStep,
  setMessages
}: RunStepParams) => {
  try {
    setCurrentStep("retrieval")
    await updateIssue(issue.id, { status: "retrieval" })
    const retrievalMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Retrieving relevant codebase files..."
    })
    setMessages(prev => [...prev, retrievalMessage])
    const embeddingsQueryText = `${issue.name} ${issue.content}`
    const codebaseFiles = await getMostSimilarEmbeddedFiles(
      embeddingsQueryText,
      project.id
    )
    const instructionsContext = attachedInstructions
      .map(
        ({ instruction }) =>
          `<instruction name="${instruction.name}">\n${instruction.content}\n</instruction>`
      )
      .join("\n\n")
    return { codebaseFiles, instructionsContext }
  } catch (error) {
    console.error("Error running retrieval step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
