import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { getFilesInContextGroup } from "@/actions/context-groups"
import { RunStepParams } from "@/types/run"

export const runRetrievalStep = async ({ issue, project, selectedContextGroupId }: RunStepParams) => {
  try {
    const embeddingsQueryText = `${issue.name} ${issue.content}`
    console.log("embeddingsQueryText", embeddingsQueryText)
    let codebaseFiles = await getMostSimilarEmbeddedFiles(
      embeddingsQueryText,
      project.id
    )

    if (selectedContextGroupId) {
      const contextGroupFiles = await getFilesInContextGroup(selectedContextGroupId)
      const contextGroupFilePaths = new Set(contextGroupFiles.map(file => file.filePath))

      // Prioritize files from the selected context group
      codebaseFiles = [
        ...codebaseFiles.filter(file => contextGroupFilePaths.has(file.path)),
        ...codebaseFiles.filter(file => !contextGroupFilePaths.has(file.path))
      ]
    }

    return { codebaseFiles }
  } catch (error) {
    console.error("Error running retrieval step:", error)
    throw error
  }
}