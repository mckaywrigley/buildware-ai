"use server"

import { getAuthenticatedOctokit } from "@/actions/github/auth"
import { SelectProject } from "@/db/schema"

export async function deleteGitHubPR(
  project: SelectProject,
  prLink: string,
  branchName: string
) {
  const octokit = await getAuthenticatedOctokit(project.githubInstallationId!)
  const [owner, repo] = project.githubRepoFullName!.split("/")

  // Extract PR number from the link
  const prNumber = parseInt(prLink.split("/").pop() || "", 10)

  if (isNaN(prNumber)) {
    throw new Error("Invalid PR link")
  }

  // Close the PR
  await octokit.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    state: "closed"
  })

  // Delete the branch
  await octokit.git.deleteRef({
    owner,
    repo,
    ref: `heads/${branchName}`
  })
}
