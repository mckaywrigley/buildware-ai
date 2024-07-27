import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { updateIssue } from "@/db/queries"
import { RunStepParams } from "@/types/run"

export const runEmbeddingStep = async ({
  issue,
  project,
  setCurrentStep
}: RunStepParams) => {
  if (!project.githubRepoFullName || !project.githubTargetBranch) {
    alert("Project has no target branch configured.")
    return
  }

  try {
    setCurrentStep("embedding")
    await updateIssue(issue.id, { status: "embedding" })
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
