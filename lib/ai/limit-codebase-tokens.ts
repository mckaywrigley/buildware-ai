import endent from "endent"
import { BUILDWARE_MAX_INPUT_TOKENS } from "../constants/buildware-config"
import { estimateClaudeSonnet3_5TokenCount } from "./estimate-claude-tokens"

export function limitCodebaseTokens(
  text: string,
  files: { path: string; content: string }[]
): string {
  let totalTokens = estimateClaudeSonnet3_5TokenCount(text)
  let codebaseFilesAsText = ""

  for (const file of files) {
    const codebaseFileText = endent`
    <file>
      <file_path>${file.path}</file_path>
      <file_content>
        ${file.content}
      </file_content>
    </file>
    `
    const fileTokens = estimateClaudeSonnet3_5TokenCount(codebaseFileText)

    // Leave 10k tokens for additional prompt tokens
    if (totalTokens + fileTokens > BUILDWARE_MAX_INPUT_TOKENS - 10000) {
      break
    }

    codebaseFilesAsText += `${codebaseFileText}\n`
    totalTokens += fileTokens
  }

  return codebaseFilesAsText
}
