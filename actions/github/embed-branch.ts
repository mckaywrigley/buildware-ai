"use server"

import { fetchFiles } from "@/actions/github/fetch-files"
import {
  createEmbeddedFile,
  deleteEmbeddedFile,
  updateEmbeddedFile
} from "@/db/queries/embedded-files-queries"
import { embedFiles } from "./embed-files"
import { tokenizeFiles } from "./tokenize-files"

export async function embedBranch(data: {
  projectId: string
  githubRepoFullName: string
  branchName: string
  embeddedBranchId: string
  installationId: number | null
  changedFiles: { filename: string; status?: string }[]
}) {
  const {
    projectId,
    githubRepoFullName,
    branchName,
    embeddedBranchId,
    installationId,
    changedFiles
  } = data

  try {
    const deletedFiles = changedFiles.filter(file => file.status === "removed")
    const filesToUpdate = await fetchFiles(
      installationId,
      changedFiles
        .filter(file => file.status !== "removed")
        .map(file => ({
          path: file.filename,
          owner: githubRepoFullName.split("/")[0],
          repo: githubRepoFullName.split("/")[1],
          ref: branchName
        }))
    )

    const tokenizedFiles = await tokenizeFiles(
      filesToUpdate.map(file => ({
        ...file,
        content: file.content || "",
        status: changedFiles.find(cf => cf.filename === file.path)?.status
      }))
    )

    const embeddedFiles = await embedFiles(tokenizedFiles)

    // Handle deleted files
    for (const file of deletedFiles) {
      await deleteEmbeddedFile(embeddedBranchId, file.filename)
    }

    // Update database for non-deleted files
    for (const file of embeddedFiles) {
      if (file.status === "added" || !file.status) {
        await createEmbeddedFile({
          ...file,
          projectId,
          embeddedBranchId,
          githubRepoFullName
        })
      } else {
        await updateEmbeddedFile({
          ...file,
          projectId,
          embeddedBranchId,
          githubRepoFullName
        })
      }
    }
  } catch (error) {
    console.error("Error in embedBranch:", error)
    throw error
  }
}
