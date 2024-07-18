import { anthropic } from "@ai-sdk/anthropic"
import { convertToCoreMessages, streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    system:
      "You are a helpful assistant that is an expert technical writer and programmer who is responsible for helping the user improve their issue description. As they tell you what they want to improve. Do it and return the improved issue description.",
    messages: convertToCoreMessages(messages)
  })

  return result.toAIStreamResponse()
}
