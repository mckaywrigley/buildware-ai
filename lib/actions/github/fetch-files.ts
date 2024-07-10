"use server"

import { GitHubFile, GitHubFileContent } from "@/lib/types/github"
import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID!
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY!

export async function fetchFiles(installationId: number, files: GitHubFile[]) {
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

  // Perform app authentication
  const auth = createAppAuth({
    appId: GITHUB_APP_ID,
    privateKey: GITHUB_PRIVATE_KEY,
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET
  })

  const { token } = await auth({
    type: "installation",
    installationId
  })

  const octokit = new Octokit({ auth: token })

  // Fetch the content of each file using Octokit
  const fetchPromises = filteredFiles.map(async (file: GitHubFile) => {
    try {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          owner: file.owner,
          repo: file.repo,
          path: file.path,
          ref: file.ref
        }
      )

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
