import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { RunStepParams } from "@/types/run"

export const runRetrievalStep = async ({ issue, project }: RunStepParams) => {
  try {
    const embeddingsQueryText = `${issue.name} ${issue.content}`
    console.log("embeddingsQueryText", embeddingsQueryText)
    const codebaseFiles = await getMostSimilarEmbeddedFiles(
      embeddingsQueryText,
      project.id
    )

    return { codebaseFiles }
  } catch (error) {
    console.error("Error running retrieval step:", error)
    throw error
  }
}
