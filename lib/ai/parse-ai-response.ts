import { AIFileInfo, AIParsedResponse } from "@/types/ai"

export function parseAIResponse(response: string): AIParsedResponse {
  const files: AIFileInfo[] = []
  const fileListMatch = response.match(/<file_list>([\s\S]*?)<\/file_list>/)
  const fileList = fileListMatch
    ? fileListMatch[1]
        .trim()
        .split("\n")
        .map(file => file.trim())
    : []

  const fileMatches = response.matchAll(
    /<file>[\s\S]*?<file_path>(.*?)<\/file_path>[\s\S]*?<file_content language="(.*?)">([\s\S]*?)<\/file_content>[\s\S]*?<file_status>(.*?)<\/file_status>[\s\S]*?<\/file>/g
  )

  for (const match of fileMatches) {
    const [_, path, language, content, status] = match
    files.push({
      path: path.trim(),
      language: language.trim(),
      content: content.trim(),
      status: status.trim() as "new" | "modified" | "deleted"
    })
  }

  // Handle deleted files (which don't have content)
  const deletedFileMatches = response.matchAll(
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

  const prTitleMatch = response.match(/<pr_title>([\s\S]*?)<\/pr_title>/)
  const prTitle = prTitleMatch ? prTitleMatch[1].trim() : ""

  return { fileList, files, prTitle }
}
