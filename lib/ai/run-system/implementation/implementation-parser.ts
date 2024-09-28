import { GeneratedFile, ParsedImplementation } from "@/types/run"

export function parseImplementationResponse(
  response: string
): ParsedImplementation {
  const pullRequestMatch = response.match(
    /<pull_request>([\s\S]*?)<\/pull_request>/
  )

  if (!pullRequestMatch) {
    return { files: [], prTitle: "", prDescription: "" }
  }

  const cleanedPullRequest = removeScratchpadTags(pullRequestMatch[1])

  const prTitle = extractContent(cleanedPullRequest, "pr_title")
  const prDescription = extractContent(cleanedPullRequest, "pr_description")
  const files = extractFiles(cleanedPullRequest)

  return { files, prTitle, prDescription }
}

function removeScratchpadTags(content: string): string {
  return content.replace(/<scratchpad>[\s\S]*?<\/scratchpad>\s*/g, "")
}

function extractContent(content: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`)
  const match = content.match(regex)
  return match ? match[1].trim() : ""
}

function extractFiles(content: string): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileListMatch = content.match(/<file_list>([\s\S]*?)<\/file_list>/)

  if (fileListMatch) {
    const fileListContent = fileListMatch[1]
    const fileMatches = fileListContent.matchAll(/<file>([\s\S]*?)<\/file>/g)

    for (const match of fileMatches) {
      const fileContent = match[1]
      const path = extractContent(fileContent, "file_path")
      const status = extractContent(fileContent, "file_status")
      const rawContent = extractContent(fileContent, "file_content")
      const contentText = rawContent ? rawContent : ""

      files.push({
        path,
        content: contentText,
        status: status as "new" | "modified" | "deleted"
      })
    }
  }

  return files
}
