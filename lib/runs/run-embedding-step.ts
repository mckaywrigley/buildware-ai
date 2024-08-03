import { checkAndEmbedTargetBranch } from "@/actions/github/check-and-embed-target-branch"
import { RunStepParams } from "@/types/run"

export const runEmbeddingStep = async ({ project }: RunStepParams) => {
  if (!project.githubRepoFullName || !project.githubTargetBranch) {
    alert("Project has no target branch configured.")
    return
  }

  try {
    await checkAndEmbedTargetBranch({
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
