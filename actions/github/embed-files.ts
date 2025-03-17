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
  if (!filesContent.length) {
    console.warn("No files to embed, returning empty array");
    return [];
  }

  let embeddings: number[][] = [];

  try {
    // Prepare inputs, ensuring no content has NULL bytes 
    const inputs = filesContent.map(file => {
      // Extra safety check to sanitize content
      const sanitizedContent = file.content.replace(/\0/g, "");
      return `${file.path}\n${sanitizedContent}`;
    });

    const response = await openai.embeddings.create({
      model: BUILDWARE_EMBEDDING_MODEL,
      dimensions: BUILDWARE_EMBEDDING_DIMENSIONS,
      input: inputs
    });

    if (response && response.data) {
      embeddings = response.data.map(item => item.embedding);
    } else {
      console.error("OpenAI API call failed, response is undefined.");
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // Return empty array instead of continuing with incomplete data
    return [];
  }

  // Ensure we have embeddings for all files
  if (embeddings.length !== filesContent.length) {
    console.error(`Mismatch between files (${filesContent.length}) and embeddings (${embeddings.length})`);
    return [];
  }

  const preparedFiles: Omit<
    InsertEmbeddedFile,
    "userId" | "projectId" | "embeddedBranchId" | "githubRepoFullName"
  >[] = filesContent.map((file, index) => ({
    path: file.path,
    content: file.content,
    tokenCount: encode(file.content).length,
    embedding: embeddings[index]
  }));

  return preparedFiles;
}