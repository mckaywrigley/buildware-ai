"use server"

import {
  createEmbeddedBranch,
  findEmbeddedBranch,
  updateEmbeddedBranchById
} from "@/db/queries/embedded-branch-queries"
import { embedBranch } from "@/lib/actions/github/embed-branch"

interface EmbedTargetBranchParams {
  projectId: string
  githubRepoFullName: string
  branchName: string
  installationId: number | null
}

export async function embedTargetBranch({
  projectId,
  githubRepoFullName,
  branchName,
  installationId
}: EmbedTargetBranchParams) {
  try {
    let embeddedBranch = await findEmbeddedBranch({
      projectId,
      githubRepoFullName,
      branchName
    })

    if (!embeddedBranch) {
      embeddedBranch = await createEmbeddedBranch({
        projectId,
        githubRepoFullName,
        branchName,
        isUpdated: false
      })
    }

    await embedBranch({
      projectId,
      githubRepoFullName,
      branchName,
      embeddedBranchId: embeddedBranch.id,
      installationId
    })

    await updateEmbeddedBranchById(embeddedBranch.id, {
      isUpdated: true
    })

    return embeddedBranch
  } catch (error) {
    console.error("Error embedding target branch:", error)
    throw error
  }
}
