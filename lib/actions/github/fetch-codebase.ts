"use server"

import { GitHubFile } from "@/lib/types/github"
import { getAuthenticatedOctokit } from "./auth"

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
