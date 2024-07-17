"use server"

import { getAuthenticatedOctokit } from "@/actions/github/auth"
import { SelectProject } from "@/db/schema"
import { AIParsedResponse } from "@/types/ai"

export async function generatePR(
  branchName: string,
  project: SelectProject,
  parsedResponse: AIParsedResponse
): Promise<{ prLink: string | null; branchName: string }> {
  const octokit = await getAuthenticatedOctokit(project.githubInstallationId!)
  const [owner, repo] = project.githubRepoFullName!.split("/")

  // Create a new branch
  const baseBranch = project.githubTargetBranch || "main"
  const timestamp = Date.now()
  let newBranch = `buildware-ai/${branchName}/${timestamp}`
  let baseRef: any

  try {
    baseRef = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`
    })

    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: baseRef.data.object.sha
    })
  } catch (error: any) {
    if (error.status === 422) {
      const retryBranch = `buildware-ai/${branchName}/${timestamp}-retry`
      try {
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${retryBranch}`,
          sha: baseRef.data.object.sha
        })
        newBranch = retryBranch
      } catch (retryError: any) {
        console.error("Retry failed:", retryError)
        throw new Error(
          `Failed to create new branch after retry: ${retryError.message}`
        )
      }
    } else {
      throw new Error(`Failed to create new branch: ${error.message}`)
    }
  }

  // Prepare changes
  const changes = []
  for (const file of parsedResponse.files) {
    if (file.status === "new" || file.status === "modified") {
      if (file.status === "modified") {
        try {
          // Fetch the current file to get its SHA
          const { data: existingFile } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: newBranch
          })

          if (Array.isArray(existingFile)) {
            throw new Error(`Expected file, got directory: ${file.path}`)
          }
        } catch (error: any) {
          if (error.status === 404) {
            console.warn(`File not found: ${file.path}. Treating as new file.`)
            // Treat as a new file if it doesn't exist
            file.status = "new"
          } else {
            throw error
          }
        }
      }

      changes.push({
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        content: file.content
      })
    } else if (file.status === "deleted") {
      changes.push({
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: null
      })
    }
  }

  // Create a tree with all changes
  if (changes.length === 0) {
    console.warn("No changes to commit. Skipping PR creation.")
    return { prLink: null, branchName: newBranch }
  }

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseRef.data.object.sha,
    tree: changes
  })

  // Create a commit
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: `AI: Update multiple files`,
    tree: tree.sha,
    parents: [baseRef.data.object.sha]
  })

  // Update the branch reference
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${newBranch}`,
    sha: commit.sha
  })

  // Create PR
  try {
    if (!commit) {
      console.warn("No commit created. Skipping PR creation.")
      return { prLink: null, branchName: newBranch }
    }

    const pr = await octokit.pulls.create({
      owner,
      repo,
      title: parsedResponse.prTitle || `AI: Update for ${branchName}`,
      head: newBranch,
      base: baseBranch,
      body: `AI: Update for ${branchName}`
    })

    return { prLink: pr.data.html_url, branchName: newBranch }
  } catch (error: any) {
    console.error("Failed to create PR:", error)
    return { prLink: null, branchName: newBranch }
  }
}
