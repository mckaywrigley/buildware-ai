"use server"

import { LLMCost } from "@/lib/utils/llm-cost"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

export const generateAIResponse = async (
  messages: Anthropic.Messages.MessageParam[]
) => {
  const message = await anthropic.messages.create(
    {
      model: "claude-3-5-sonnet-20240620",
      system:
        "You are a helpful assistant that can answer questions and help with tasks.",
      messages,
      max_tokens: parseInt(process.env.NEXT_PUBLIC_MAX_OUTPUT_TOKENS!)
    },
    {
      headers: {
        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
      }
    }
  )

  // const { text, usage } = await generateText({
  //   model: anthropic("claude-3-5-sonnet-20240620"),
  //   messages,
  //   maxTokens: parseInt(process.env.NEXT_PUBLIC_MAX_OUTPUT_TOKENS!)
  // })

  console.warn("usage", message.usage)
  const cost = LLMCost({
    llmId: "claude-3-5-sonnet-20240620",
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens
  })
  console.warn("cost", cost)

  return message.content[0].type === "text" ? message.content[0].text : ""
}
