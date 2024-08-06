"use server"

import {
  createEmbeddedBranch,
  findEmbeddedBranch,
  updateEmbeddedBranchById
} from "@/db/queries/embedded-branches-queries"
import { Octokit } from "@octokit/rest"
import { getAuthenticatedOctokit } from "./auth"
import { handleBranchEmbeddings } from "./handle-branch-embeddings"

interface EmbedTargetBranchParams {
  projectId: string
  githubRepoFullName: string
  branchName: string
  installationId: number | null
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (
        error.status === 403 &&
        error.message.includes("secondary rate limit")
      ) {
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          60000
        )
        console.warn(`Rate limited. Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
  throw new Error("Max retries reached")
}

export async function checkAndEmbedTargetBranch({
  projectId,
  githubRepoFullName,
  branchName,
  installationId
}: EmbedTargetBranchParams) {
  try {
    const [owner, repo] = githubRepoFullName.split("/")
    const octokit = await getAuthenticatedOctokit(installationId)

    // Fetch the latest commit hash with retry
    const { data: branchData } = await retryWithBackoff(() =>
      octokit.repos.getBranch({
        owner,
        repo,
        branch: branchName
      })
    )
    const latestCommitHash = branchData.commit.sha

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
        lastEmbeddedCommitHash: null
      })
    }

    let changedFiles: {
      filename: string
      status: string
      previous_filename?: string
    }[] = []

    if (embeddedBranch.lastEmbeddedCommitHash) {
      try {
        const { data: compareData } = await retryWithBackoff(() =>
          octokit.repos.compareCommits({
            owner,
            repo,
            base: embeddedBranch.lastEmbeddedCommitHash as string,
            head: latestCommitHash
          })
        )
        changedFiles =
          compareData.files?.map(file => ({
            filename: file.filename,
            status: file.status,
            previous_filename: file.previous_filename
          })) || []
      } catch (error) {
        console.warn("Error comparing commits:", error)
        // If comparison fails, treat all files as changed
        changedFiles = await getAllRepoFiles(
          octokit,
          owner,
          repo,
          latestCommitHash
        )
      }
    } else {
      // If there's no lastEmbeddedCommitHash, treat all files as changed
      changedFiles = await getAllRepoFiles(
        octokit,
        owner,
        repo,
        latestCommitHash
      )
    }

    // Normalize changedFiles structure
    changedFiles = changedFiles.map(file => ({
      filename: file.filename,
      status: file.status || "added",
      previous_filename: file.previous_filename
    }))

    if (embeddedBranch.lastEmbeddedCommitHash !== latestCommitHash) {
      console.warn("Branch needs updating")
      await handleBranchEmbeddings({
        projectId,
        githubRepoFullName,
        branchName,
        embeddedBranchId: embeddedBranch.id,
        installationId,
        changedFiles
      })

      await updateEmbeddedBranchById(embeddedBranch.id, {
        lastEmbeddedCommitHash: latestCommitHash
      })
    }

    return embeddedBranch
  } catch (error) {
    console.error("Error embedding target branch:", error)
    throw error
  }
}

async function getAllRepoFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  commitSha: string
): Promise<any[]> {
  const { data: tree } = await retryWithBackoff(() =>
    octokit.git.getTree({
      owner,
      repo,
      tree_sha: commitSha,
      recursive: "true"
    })
  )

  return tree.tree
    .filter((item: any) => item.type === "blob")
    .map((item: any) => ({ filename: item.path }))
}
