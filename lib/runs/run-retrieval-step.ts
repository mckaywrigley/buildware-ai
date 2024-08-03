import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { SelectIssue, SelectProject } from "@/db/schema"

export const runRetrievalStep = async ({
  issue,
  project
}: {
  issue: SelectIssue
  project: SelectProject
}) => {
  try {
    const embeddingsQueryText = `${issue.name} ${issue.content}`
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
