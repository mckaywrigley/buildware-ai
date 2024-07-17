"use server"

import { GitHubFile } from "@/types/github"
import { Octokit } from "@octokit/rest"
import { getAuthenticatedOctokit } from "./auth"

const MAX_RETRIES = 5
const INITIAL_DELAY = 1000 // 1 second

export async function fetchWithRetry(
  octokit: Octokit,
  params: any,
  retries = 0
): Promise<any> {
  try {
    return await octokit.repos.getContent(params)
  } catch (error: any) {
    if (
      error.status === 403 &&
      error.message.includes("secondary rate limit") &&
      retries < MAX_RETRIES
    ) {
      const delay = INITIAL_DELAY * Math.pow(2, retries)
      console.warn(`Hit secondary rate limit. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(octokit, params, retries + 1)
    }
    throw error
  }
}

export async function fetchCodebaseForBranch(data: {
  githubRepoFullName: string
  path: string
  branch: string
  installationId: number | null
}) {
  try {
    const contents = await fetchDirectoryContent(data)

    const files: GitHubFile[] = []

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
  installationId: number | null
}) {
  const [organization, repo] = data.githubRepoFullName.split("/")

  try {
    const octokit = await getAuthenticatedOctokit(data.installationId)
    const { data: content } = await fetchWithRetry(octokit, {
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
