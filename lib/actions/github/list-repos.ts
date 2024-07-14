"use server"

import { GitHubRepository } from "@/lib/types/github"
import { getAuthenticatedOctokit } from "./auth"

export const listRepos = async (
  installationId: number | null
): Promise<GitHubRepository[]> => {
  try {
    const octokit = await getAuthenticatedOctokit(installationId)

    let repositories: any[]

    if (installationId) {
      const response = await octokit.apps.listReposAccessibleToInstallation()
      repositories = response.data.repositories
    } else {
      const response = await octokit.request("GET /user/repos")
      repositories = response.data
    }

    return repositories
      .map(repo => ({
        description: repo.description,
        full_name: repo.full_name,
        html_url: repo.html_url,
        id: repo.id,
        name: repo.name,
        private: repo.private
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error: any) {
    throw new Error(error)
  }
}
