import { BUILDWARE_MAX_INPUT_TOKENS } from "../constants/buildware-config"
import { estimateClaudeSonnet3_5TokenCount } from "./estimate-claude-tokens"

export function limitTokens(
  basePrompt: string,
  files: { path: string; content: string }[]
): { prompt: string; includedFiles: typeof files; tokensUsed: number } {
  let totalTokens = estimateClaudeSonnet3_5TokenCount(basePrompt)
  const includedFiles: typeof files = []

  for (const file of files) {
    const fileContent = `# File Path: ${file.path}\n${file.content}`
    const fileTokens = estimateClaudeSonnet3_5TokenCount(fileContent)

    if (totalTokens + fileTokens <= BUILDWARE_MAX_INPUT_TOKENS) {
      includedFiles.push(file)
      totalTokens += fileTokens
    } else {
      break
    }
  }

  const codebaseContext =
    includedFiles.length > 0
      ? `# Available Codebase Files\n${includedFiles.map(file => `## File Path: ${file.path}\n${file.content}`).join("\n\n")}`
      : "No codebase files."

  const prompt = `${basePrompt}${codebaseContext}`
  return {
    prompt,
    includedFiles,
    tokensUsed: totalTokens
  }
}
