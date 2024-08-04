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
  changedFiles: {
    filename: string
    status?: string
    previous_filename?: string
  }[]
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
    const renamedFiles = changedFiles.filter(file => file.status === "renamed")
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

    // Handle renamed files
    for (const file of renamedFiles) {
      if (file.previous_filename && file.filename) {
        const embeddedFile = embeddedFiles.find(f => f.path === file.filename)
        if (embeddedFile) {
          await updateEmbeddedFile(
            {
              ...embeddedFile,
              projectId,
              embeddedBranchId,
              githubRepoFullName
            },
            file.previous_filename
          )
        }
      }
    }

    // Update database for non-deleted and non-renamed files
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
