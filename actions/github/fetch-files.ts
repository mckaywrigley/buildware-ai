"use server"

import { GitHubFile, GitHubFileContent } from "@/types/github"
import { getAuthenticatedOctokit } from "./auth"
import { fetchWithRetry } from "./fetch-codebase"

export async function fetchFiles(
  installationId: number | null,
  files: GitHubFile[]
) {
  // List of file extensions to exclude
  const excludedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".svg",
    ".tiff",
    ".webp",
    ".ico",
    ".heic",
    ".raw"
  ]

  // List of files to exclude
  const excludedFiles = ["package-lock.json"]

  // List of directories to exclude
  const excludedDirs = ["public", "migrations", "node_modules"]

  // Filter out unwanted files or directories based on excludedFiles, excludedDirs, and excludedExtensions
  const filteredFiles = files.filter(
    (file: any) =>
      !excludedFiles.includes(file.name) &&
      !excludedDirs.some(dir => file.path.includes(dir)) &&
      !excludedExtensions.some(extension => file.name.endsWith(extension))
  )

  const octokit = await getAuthenticatedOctokit(installationId)

  // Fetch the content of each file using Octokit with retry logic
  const fetchPromises = filteredFiles.map(async (file: GitHubFile) => {
    try {
      const { data } = await fetchWithRetry(octokit, {
        owner: file.owner,
        repo: file.repo,
        path: file.path,
        ref: file.ref
      })

      if (Array.isArray(data) || !("content" in data)) {
        throw new Error(`Unexpected response for ${file.path}`)
      }

      return {
        name: file.name,
        path: file.path,
        content: Buffer.from(data.content, "base64").toString("utf-8")
      }
    } catch (error) {
      console.error("Error fetching file:", file, error)
      throw error
    }
  })

  // Wait for all fetch promises to resolve
  const filesContent = await Promise.all(fetchPromises)

  return filesContent as GitHubFileContent[]
}
