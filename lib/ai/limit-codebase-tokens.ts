import endent from "endent"
import { estimateClaudeTokens } from "./estimate-claude-tokens"

export function limitCodebaseTokens(
  files: { path: string; content: string }[],
  usedTokens: number,
  maxTokens: number
) {
  let injectedFiles = ""

  for (const file of files) {
    const injectedFile = endent`
    <file>
      <file_path>${file.path}</file_path>
      <file_content>
        ${file.content}
      </file_content>
    </file>
    `
    const fileTokens = estimateClaudeTokens(injectedFile)

    if (usedTokens + fileTokens > maxTokens) {
      break
    }

    injectedFiles += `${injectedFile}\n`
    usedTokens += fileTokens
  }

  return injectedFiles
}
