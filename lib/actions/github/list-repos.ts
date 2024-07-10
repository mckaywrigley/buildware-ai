"use server"

import { GitHubRepository } from "@/lib/types/github"
import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID!
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY!

export const listRepos = async (
  installationId: number
): Promise<GitHubRepository[]> => {
  try {
    const auth = createAppAuth({
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_PRIVATE_KEY,
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET
    })

    const { token } = await auth({ type: "installation", installationId })
    const octokit = new Octokit({ auth: token })

    const { data } = await octokit.apps.listReposAccessibleToInstallation()

    return data.repositories
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
