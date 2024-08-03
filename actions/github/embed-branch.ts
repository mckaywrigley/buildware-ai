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
    // Fetch only changed files
    const filesToUpdate = await fetchFiles(
      installationId,
      changedFiles.map(file => ({
        path: file.filename,
        owner: githubRepoFullName.split("/")[0],
        repo: githubRepoFullName.split("/")[1],
        ref: branchName
      }))
    )

    // Tokenize files
    const tokenizedFiles = await tokenizeFiles(
      filesToUpdate.map(file => ({
        ...file,
        content: file.content || "",
        status: changedFiles.find(cf => cf.filename === file.path)?.status
      }))
    )

    // Embed files
    const embeddedFiles = await embedFiles(tokenizedFiles)

    // Update database only if embedding was successful
    for (const file of embeddedFiles) {
      if (file.status === "removed") {
        await deleteEmbeddedFile(embeddedBranchId, file.path)
      } else if (file.status === "added" || !file.status) {
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
    // Don't update anything if there's an error
    throw error
  }
}
