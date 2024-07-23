import { AIFileInfo, AIParsedActResponse } from "@/types/ai"

export function parseCodegenActResponse(response: string): AIParsedActResponse {
  const pullRequestMatch = response.match(
    /<pull_request>([\s\S]*?)<\/pull_request>/
  )

  if (!pullRequestMatch) {
    throw new Error("Invalid response format: Missing <pull_request> tags")
  }

  const pullRequestContent = pullRequestMatch[1]

  const prTitleMatch = pullRequestContent.match(
    /<pr_title>([\s\S]*?)<\/pr_title>/
  )
  const prTitle = prTitleMatch ? prTitleMatch[1].trim() : ""

  const prDescriptionMatch = pullRequestContent.match(
    /<pr_description>([\s\S]*?)<\/pr_description>/
  )
  const prDescription = prDescriptionMatch ? prDescriptionMatch[1].trim() : ""

  const files: AIFileInfo[] = []
  const fileListMatch = pullRequestContent.match(
    /<file_list>([\s\S]*?)<\/file_list>/
  )

  if (fileListMatch) {
    const fileMatches = fileListMatch[1].matchAll(
      /<file>[\s\S]*?<file_path>(.*?)<\/file_path>[\s\S]*?<file_content>([\s\S]*?)<\/file_content>[\s\S]*?<file_status>(.*?)<\/file_status>[\s\S]*?<\/file>/g
    )

    for (const match of fileMatches) {
      const [_, path, content, status] = match
      files.push({
        path: path.trim(),
        language: path.split(".").pop() || "",
        content: content.trim(),
        status: status.trim() as "new" | "modified" | "deleted"
      })
    }

    // Handle deleted files (which don't have content)
    const deletedFileMatches = fileListMatch[1].matchAll(
      /<file>[\s\S]*?<file_path>(.*?)<\/file_path>[\s\S]*?<file_status>deleted<\/file_status>[\s\S]*?<\/file>/g
    )

    for (const match of deletedFileMatches) {
      const [_, path] = match
      files.push({
        path: path.trim(),
        language: "",
        content: "",
        status: "deleted"
      })
    }
  }

  return { files, prTitle, prDescription }
}
