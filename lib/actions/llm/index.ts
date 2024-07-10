"use server"

import { LLMCost } from "@/lib/utils/llm-cost"
import { anthropic } from "@ai-sdk/anthropic"
import { CoreMessage, generateText } from "ai"

export const generateAIResponse = async (messages: CoreMessage[]) => {
  const { text, usage } = await generateText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    messages,
    maxTokens: parseInt(process.env.NEXT_PUBLIC_MAX_OUTPUT_TOKENS!)
  })
  console.warn("usage", usage)
  const cost = LLMCost({
    llmId: "claude-3-5-sonnet-20240620",
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens
  })
  console.warn("cost", cost)

  return text
}
