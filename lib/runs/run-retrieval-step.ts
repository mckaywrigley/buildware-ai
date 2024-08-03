import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { SelectIssue, SelectProject } from "@/db/schema"
import { getFilesInContextGroup } from "@/actions/context-group-files/get-files-in-context-group"

export const runRetrievalStep = async ({
  issue,
  project,
  selectedContextGroupIds
}: {
  issue: SelectIssue
  project: SelectProject
  selectedContextGroupIds: string[]
}) => {
  try {
    const embeddingsQueryText = `${issue.name} ${issue.content}`
    let codebaseFiles = await getMostSimilarEmbeddedFiles(
      embeddingsQueryText,
      project.id
    )

    // Prioritize files from selected context groups
    if (selectedContextGroupIds.length > 0) {
      const contextGroupFiles = await Promise.all(
        selectedContextGroupIds.map(id => getFilesInContextGroup(id))
      )
      const prioritizedFilePaths = new Set(
        contextGroupFiles.flat().map(file => file.filePath)
      )

      // Move prioritized files to the front of the array
      codebaseFiles.sort((a, b) => {
        const aIsPrioritized = prioritizedFilePaths.has(a.path)
        const bIsPrioritized = prioritizedFilePaths.has(b.path)
        if (aIsPrioritized && !bIsPrioritized) return -1
        if (!aIsPrioritized && bIsPrioritized) return 1
        return 0
      })
    }

    return { codebaseFiles }
  } catch (error) {
    console.error("Error running retrieval step:", error)
    throw error
  }
}