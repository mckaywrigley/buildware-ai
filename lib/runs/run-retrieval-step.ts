import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { RunStepParams } from "@/types/run"

export const runRetrievalStep = async ({
  issue,
  project,
  instructions
}: RunStepParams) => {
  try {
    const embeddingsQueryText = `${issue.name} ${issue.content}`
    const codebaseFiles = await getMostSimilarEmbeddedFiles(
      embeddingsQueryText,
      project.id
    )

    const instructionsContext = instructions
      .map(
        ({ instruction }) =>
          `<instruction name="${instruction.name}">\n${instruction.content}\n</instruction>`
      )
      .join("\n\n")

    return { codebaseFiles, instructionsContext }
  } catch (error) {
    console.error("Error running retrieval step:", error)
    throw error
  }
}
