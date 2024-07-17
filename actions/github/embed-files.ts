"use server"

import { InsertEmbeddedFile } from "@/db/schema"
import {
  BUILDWARE_EMBEDDING_DIMENSIONS,
  BUILDWARE_EMBEDDING_MODEL
} from "@/lib/constants/buildware-config"
import { GitHubFileContent } from "@/types/github"
import { encode } from "gpt-tokenizer"
import OpenAI from "openai"

const openai = new OpenAI()

export async function embedFiles(filesContent: GitHubFileContent[]) {
  let embeddings: number[][] = []

  try {
    const response = await openai.embeddings.create({
      model: BUILDWARE_EMBEDDING_MODEL,
      dimensions: BUILDWARE_EMBEDDING_DIMENSIONS,
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
