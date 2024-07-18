"use server"

import { calculateLLMCost } from "@/lib/ai/calculate-llm-cost"
import { BUILDWARE_MAX_OUTPUT_TOKENS } from "@/lib/constants/buildware-config"
import Anthropic from "@anthropic-ai/sdk"
import { mergePartialResults } from "@/lib/ai/merge-partial-results"
import { parseAIResponse } from "@/lib/ai/parse-ai-response"
import { trackGenerationProgress } from "@/lib/ai/track-generation-progress"

const anthropic = new Anthropic()

const MAX_ITERATIONS = 5

export const generateAIResponse = async (
  messages: Anthropic.Messages.MessageParam[],
  iteration: number = 0
) => {
  const message = await anthropic.messages.create(
    {
      model: "claude-3-5-sonnet-20240620",
      system:
        "You are a helpful assistant that can answer questions and help with tasks.",
      messages,
      max_tokens: BUILDWARE_MAX_OUTPUT_TOKENS
    },
    {
      headers: {
        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
      }
    }
  )

  console.warn("usage", message.usage)
  const cost = calculateLLMCost({
    llmId: "claude-3-5-sonnet-20240620",
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens
  })
  console.warn("cost", cost)

  return message.content[0].type === "text" ? message.content[0].text : ""
}

export const generateCompleteAIResponse = async (
  initialMessages: Anthropic.Messages.MessageParam[]
) => {
  let accumulatedContent = ""
  let iteration = 0
  let isComplete = false

  while (!isComplete && iteration < MAX_ITERATIONS) {
    const response = await generateAIResponse(initialMessages, iteration)
    const parsedResponse = parseAIResponse(response)
    
    accumulatedContent = mergePartialResults(accumulatedContent, parsedResponse)
    isComplete = parsedResponse.isComplete

    if (!isComplete) {
      initialMessages.push({ role: "assistant", content: response })
      initialMessages.push({ role: "user", content: "Please continue where you left off." })
    }

    trackGenerationProgress(iteration, isComplete)
    iteration++
  }

  if (!isComplete) {
    console.warn("Max iterations reached without completing the generation.")
  }

  return accumulatedContent
}