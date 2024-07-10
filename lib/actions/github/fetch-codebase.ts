"use server"

import { GitHubFile } from "@/lib/types/github"
import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID!
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY!

export async function fetchCodebaseForBranch(data: {
  githubRepoFullName: string
  path: string
  branch: string
  installationId: number
}) {
  try {
    const contents = await fetchDirectoryContent(data)

    let files: GitHubFile[] = []

    const [owner, repo] = data.githubRepoFullName.split("/")

    for (const item of contents) {
      if (item.type === "file") {
        files.push({
          ...item,
          owner,
          repo,
          ref: data.branch
        })
      } else if (item.type === "dir" && !item.name.startsWith(".")) {
        try {
          const nestedFiles = await fetchCodebaseForBranch({
            ...data,
            path: item.path
          })
          files.push(...nestedFiles)
        } catch (error) {
          console.error(`Error fetching nested files for ${item.path}:`, error)
          throw error
        }
      }
    }

    return files
  } catch (error) {
    console.error(`Error fetching codebase for path ${data.path}:`, error)
    throw error
  }
}

async function fetchDirectoryContent(data: {
  githubRepoFullName: string
  path: string
  branch: string
  installationId: number
}) {
  const [organization, repo] = data.githubRepoFullName.split("/")

  try {
    const auth = createAppAuth({
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_PRIVATE_KEY,
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET
    })

    const { token } = await auth({
      type: "installation",
      installationId: data.installationId
    })
    const octokit = new Octokit({ auth: token })

    const { data: content } = await octokit.repos.getContent({
      owner: organization,
      repo,
      path: data.path,
      ref: data.branch
    })

    return Array.isArray(content) ? content : [content]
  } catch (error) {
    console.error("Error fetching directory content:", error)
    throw error
  }
}
