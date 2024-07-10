"use server"

import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"

export async function getAuthenticatedOctokit(installationId: number) {
  const auth = createAppAuth({
    appId: process.env.NEXT_PUBLIC_GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!
  })

  const { token } = await auth({ type: "installation", installationId })
  return new Octokit({ auth: token })
}
