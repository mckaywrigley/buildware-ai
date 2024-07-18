"use server"

import { generateText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function improveContent(
  title: string,
  content: string,
  improvementPrompt: string[]
): Promise<string> {
  const prompt = `You are an expert technical writer and programmer. Your task is to improve the given content that describes a coding task. Follow these steps:

    1. Carefully read the original content.
    2. Review the improvement instructions.
    3. Apply the requested improvements to the content.
    4. Ensure the improved content maintains technical accuracy.
    5. Adjust the writing style to be clear, concise, and maintain the user's original request.
    
    Original Title:
    ${title}

    Original Content:
    ${content}
  
    Improvement Instructions:
    ${improvementPrompt.join("\n\n")}

    Improved Content:`

  try {
    const result = await generateText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      prompt: prompt
    })

    return result.text
  } catch (error) {
    console.error("Error improving issue:", error)
    throw error
  }
}
