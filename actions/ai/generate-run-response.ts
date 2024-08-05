"use server"

import { calculateLLMCost } from "@/lib/ai/calculate-llm-cost"
import {
  BUILDWARE_MAX_OUTPUT_TOKENS,
  BuildwareModel
} from "@/lib/constants/buildware-config"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

export const generateRunResponse = async ({
  system,
  messages,
  model,
  prefill
}: {
  system: string
  messages: Anthropic.Messages.MessageParam[]
  model: BuildwareModel
  prefill: string
}) => {
  const finalMessages = [
    ...messages,
    { role: "assistant", content: prefill.trimEnd() }
  ] as Anthropic.Messages.MessageParam[]

  const message = await anthropic.messages.create(
    {
      model,
      system,
      messages: finalMessages,
      max_tokens: model.includes("haiku")
        ? Math.min(BUILDWARE_MAX_OUTPUT_TOKENS, 4096)
        : BUILDWARE_MAX_OUTPUT_TOKENS,
      temperature: 1
    },
    {
      headers: {
        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
      }
    }
  )

  const isComplete = message.stop_reason !== "max_tokens"

  const cost = calculateLLMCost({
    llmId: model,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens
  })
  console.warn("usage", message.usage)
  console.warn("cost", cost)

  return {
    content: message.content[0].type === "text" ? message.content[0].text : "",
    isComplete
  }
}
