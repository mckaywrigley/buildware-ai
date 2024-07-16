"use server"

import { getAuthenticatedOctokit } from "./auth"

export const listBranches = async (
  installationId: number | null,
  repoFullName: string
): Promise<string[]> => {
  try {
    const octokit = await getAuthenticatedOctokit(installationId)

    const [owner, repo] = repoFullName.split("/")
    const { data } = await octokit.repos.listBranches({ owner, repo })

    return data.map(branch => branch.name)
  } catch (error: any) {
    console.error("Error fetching branches:", error)
    return []
  }
}
