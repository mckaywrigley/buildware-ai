"use server"

import { InsertEmbeddedFile } from "@/db/schema"
import { GitHubFileContent } from "@/lib/types/github"
import { encode } from "gpt-tokenizer"
import OpenAI from "openai"

const EMBEDDING_MODEL = process.env.NEXT_PUBLIC_EMBEDDING_MODEL!
const EMBEDDING_DIMENSIONS = parseInt(
  process.env.NEXT_PUBLIC_EMBEDDING_DIMENSIONS!
)

const openai = new OpenAI()

export async function embedFiles(filesContent: GitHubFileContent[]) {
  let embeddings: number[][] = []

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      // embed path + content
      input: filesContent.map(file => `${file.path}\n${file.content}`)
    })

    if (response && response.data) {
      embeddings = response.data.map(item => item.embedding)
    } else {
      console.error("OpenAI API call failed, response is undefined.")
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error)
  }

  const preparedFiles: Omit<
    InsertEmbeddedFile,
    "userId" | "projectId" | "embeddedBranchId" | "githubRepoFullName"
  >[] = filesContent.map((file, index) => ({
    path: file.path,
    content: file.content,
    tokenCount: encode(file.content).length,
    embedding: embeddings[index]
  }))

  return preparedFiles
}
