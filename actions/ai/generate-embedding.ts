"use server"

import {
  BUILDWARE_EMBEDDING_DIMENSIONS,
  BUILDWARE_EMBEDDING_MODEL
} from "@/lib/constants/buildware-config"
import OpenAI from "openai"

const openai = new OpenAI()

export async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: BUILDWARE_EMBEDDING_MODEL,
      dimensions: BUILDWARE_EMBEDDING_DIMENSIONS,
      input: text
    })

    return response.data[0].embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw error
  }
}
