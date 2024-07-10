"use server"

import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID!
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY!

export const listBranches = async (
  installationId: number,
  repoFullName: string
): Promise<string[]> => {
  try {
    const auth = createAppAuth({
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_PRIVATE_KEY,
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET
    })

    const { token } = await auth({ type: "installation", installationId })
    const octokit = new Octokit({ auth: token })

    const [owner, repo] = repoFullName.split("/")
    const { data } = await octokit.repos.listBranches({ owner, repo })

    return data.map(branch => branch.name)
  } catch (error: any) {
    console.error("Error fetching branches:", error)
    return []
  }
}