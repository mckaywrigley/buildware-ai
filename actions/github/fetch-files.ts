"use server"

import { GitHubFile } from "@/types/github"
import { getAuthenticatedOctokit } from "./auth"
import { retryWithBackoff } from "./check-and-embed-target-branch"

interface FileToFetch {
  path: string
  owner: string
  repo: string
  ref: string
}

export async function fetchFiles(
  installationId: number | null,
  filesToFetch: FileToFetch[]
): Promise<GitHubFile[]> {
  const octokit = await getAuthenticatedOctokit(installationId)

  const fetchedFiles = await Promise.all(
    filesToFetch.map(async file => {
      try {
        const { data } = await retryWithBackoff(() =>
          octokit.repos.getContent({
            owner: file.owner,
            repo: file.repo,
            path: file.path,
            ref: file.ref
          })
        )

        if (Array.isArray(data) || data.type !== "file") {
          throw new Error(
            `Expected file, got ${Array.isArray(data) ? "array" : data.type}`
          )
        }

        return {
          type: "file" as const,
          size: data.size,
          name: data.name,
          path: data.path,
          sha: data.sha,
          url: data.url,
          git_url: data.git_url,
          html_url: data.html_url,
          download_url: data.download_url,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
          encoding: data.encoding,
          owner: file.owner,
          repo: file.repo,
          ref: file.ref,
          _links: data._links
        }
      } catch (error) {
        console.error(`Error fetching file ${file.path}:`, error)
        throw error
      }
    })
  )

  return fetchedFiles
}
