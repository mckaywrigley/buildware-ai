"use server"

import { GitHubFileContent } from "@/types/github"
import { encode } from "gpt-tokenizer"

export async function tokenizeFiles(filesContent: GitHubFileContent[]) {
  // Filter out files with more than 8k tokens and 0 tokens
  const tokenizedFiles = filesContent.filter(
    file =>
      typeof file.content === "string" &&
      encode(file.content).length <= 8000 &&
      encode(file.content).length > 0
  )

  return tokenizedFiles
}
