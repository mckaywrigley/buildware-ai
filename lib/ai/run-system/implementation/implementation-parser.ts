import { GeneratedFile, ParsedImplementation } from "@/types/run"

export function parseImplementationResponse(
  response: string
): ParsedImplementation {
  const pullRequestContent = extractBalancedContent(response, "pull_request")
  if (!pullRequestContent) {
    throw new Error(
      "Invalid response format: Missing or unbalanced <pull_request> tags"
    )
  }

  const prTitle = extractBalancedContent(pullRequestContent, "pr_title") || ""
  const prDescription =
    extractBalancedContent(pullRequestContent, "pr_description") || ""
  const files = extractFiles(pullRequestContent)

  return { files, prTitle, prDescription }
}

function extractBalancedContent(
  content: string,
  tagName: string
): string | null {
  const stack: number[] = []
  const openTag = `<${tagName}>`
  const closeTag = `</${tagName}>`
  let start = -1

  for (let i = 0; i < content.length; i++) {
    if (content.startsWith(openTag, i)) {
      if (stack.length === 0) start = i + openTag.length
      stack.push(i)
      i += openTag.length - 1
    } else if (content.startsWith(closeTag, i)) {
      if (stack.length === 0) return null // Unbalanced tags
      stack.pop()
      if (stack.length === 0) {
        return content.slice(start, i)
      }
      i += closeTag.length - 1
    }
  }

  return null // Unbalanced tags
}

function extractFiles(content: string): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const fileListContent = extractBalancedContent(content, "file_list")

  if (fileListContent) {
    const fileMatches = fileListContent.matchAll(/<file>([\s\S]*?)<\/file>/g)
    for (const match of fileMatches) {
      const fileContent = match[1]
      const status = extractBalancedContent(fileContent, "file_status") || ""
      const path = extractBalancedContent(fileContent, "file_path") || ""
      const fileContentText =
        extractBalancedContent(fileContent, "file_content") || ""

      files.push({
        path: path.trim(),
        content: fileContentText.trim(),
        status: status.trim() as "new" | "modified" | "deleted"
      })
    }
  }

  return files
}
