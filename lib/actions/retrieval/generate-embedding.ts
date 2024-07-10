"use server"

import OpenAI from "openai"

const openai = new OpenAI()

export async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: process.env.NEXT_PUBLIC_EMBEDDING_MODEL!,
      dimensions: +process.env.NEXT_PUBLIC_EMBEDDING_DIMENSIONS!,
      input: text
    })

    return response.data[0].embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw error
  }
}
