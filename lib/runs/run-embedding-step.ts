import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { RunStepParams } from "@/types/run"

export const runEmbeddingStep = async ({ project }: RunStepParams) => {
  if (!project.githubRepoFullName || !project.githubTargetBranch) {
    alert("Project has no target branch configured.")
    return
  }

  try {
    await embedTargetBranch({
      projectId: project.id,
      githubRepoFullName: project.githubRepoFullName,
      branchName: project.githubTargetBranch,
      installationId: project.githubInstallationId
    })
  } catch (error) {
    console.error("Error running embedding step:", error)
    throw error
  }
}
