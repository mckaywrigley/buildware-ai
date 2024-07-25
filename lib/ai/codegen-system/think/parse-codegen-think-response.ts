import { AIParsedThinkResponse, AIThought } from "@/types/ai"

export function parseCodegenThinkResponse(
  response: string
): AIParsedThinkResponse {
  const thoughts: AIThought[] = []
  const thoughtsMatch = response.match(/<thoughts>([\s\S]*?)<\/thoughts>/)

  if (thoughtsMatch) {
    const thoughtMatches = thoughtsMatch[1].matchAll(
      /<thought>[\s\S]*?<thought_number>(.*?)<\/thought_number>[\s\S]*?<thought_text>([\s\S]*?)<\/thought_text>[\s\S]*?<\/thought>/g
    )

    for (const match of thoughtMatches) {
      const [_, number, text] = match
      thoughts.push({
        number: parseInt(number.trim()),
        text: text.trim()
      })
    }
  }

  return { thoughts }
}
