import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { createIssueMessage, updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runEmbeddingStep = async ({
  issue,
  project,
  setCurrentStep,
  setMessages
}: RunStepParams) => {
  if (!project.githubRepoFullName || !project.githubTargetBranch) {
    alert("Project has no target branch configured.")
    return
  }

  try {
    setCurrentStep("embedding")
    await updateIssue(issue.id, { status: "embedding" })
    const embeddingMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Embedding target branch..."
    })
    setMessages(prev => [...prev, embeddingMessage])
    await embedTargetBranch({
      projectId: project.id,
      githubRepoFullName: project.githubRepoFullName,
      branchName: project.githubTargetBranch,
      installationId: project.githubInstallationId
    })
  } catch (error) {
    console.error("Error running embedding step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
