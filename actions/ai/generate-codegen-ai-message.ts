"use server"

import { calculateLLMCost } from "@/lib/ai/calculate-llm-cost"
import { BUILDWARE_MAX_OUTPUT_TOKENS } from "@/lib/constants/buildware-config"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

export const generateCodegenAIMessage = async (
  messages: Anthropic.Messages.MessageParam[],
  system: string
) => {
  const message = await anthropic.messages.create(
    {
      model: "claude-3-5-sonnet-20240620",
      system,
      messages,
      max_tokens: BUILDWARE_MAX_OUTPUT_TOKENS
    },
    {
      headers: {
        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
      }
    }
  )

  const cost = calculateLLMCost({
    llmId: "claude-3-5-sonnet-20240620",
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens
  })
  console.warn("usage", message.usage)
  console.warn("cost", cost)

  return message.content[0].type === "text" ? message.content[0].text : ""
}
