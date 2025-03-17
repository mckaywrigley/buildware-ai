"use server"

import { GitHubFile, GitHubFileContent } from "@/types/github"
import { getAuthenticatedOctokit } from "./auth"
import { fetchWithRetry } from "./fetch-codebase"

/**
 * Checks if content contains null bytes (0x00) which would cause UTF-8 encoding issues
 */
function containsNullBytes(content: string): boolean {
  return content.includes('\0');
}

/**
 * Checks if a file is likely binary based on extension or content sampling
 */
function isLikelyBinaryFile(fileName: string): boolean {
  // Extended list of binary file extensions
  const binaryExtensions = [
    // Images
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".tiff", ".webp", ".ico", ".heic", ".raw",
    // Audio/Video
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv", ".flac", ".ogg", ".webm",
    // Archives
    ".zip", ".rar", ".tar", ".gz", ".7z", ".jar", ".war", ".ear",
    // Documents
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    // Executables
    ".exe", ".dll", ".so", ".dylib", ".bin", ".pyc", ".class",
    // Design files
    ".psd", ".ai", ".sketch", ".xd", ".fig",
    // Database
    ".db", ".sqlite", ".sqlite3", ".mdb",
    // Other
    ".ttf", ".otf", ".woff", ".woff2", ".eot"
  ];

  return binaryExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

export async function fetchFiles(
  installationId: number | null,
  files: GitHubFile[]
) {
  // List of file extensions to exclude
  const excludedExtensions = [
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".tiff", ".webp", ".ico", ".heic", ".raw"
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
      !excludedExtensions.some(extension => file.name.endsWith(extension)) &&
      !isLikelyBinaryFile(file.name) // Add binary file check
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

      // Decode content
      const content = Buffer.from(data.content, "base64").toString("utf-8")
      
      // Safety check - if content contains null bytes, skip this file
      if (containsNullBytes(content)) {
        console.warn(`Skipping file with null bytes: ${file.path}`)
        return null;
      }

      return {
        name: file.name,
        path: file.path,
        content
      }
    } catch (error) {
      console.error("Error fetching file:", file, error)
      // Return null instead of throwing to continue processing other files
      return null;
    }
  })

  // Wait for all fetch promises to resolve and filter out nulls (skipped files)
  const filesContent = (await Promise.all(fetchPromises)).filter(Boolean)

  return filesContent as GitHubFileContent[]
}