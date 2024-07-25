import { AIClarificationItem, AIParsedClarifyResponse } from "@/types/ai"

export function parseCodegenClarifyResponse(
  response: string
): AIParsedClarifyResponse {
  const clarifications: AIClarificationItem[] = []
  const clarificationsMatch = response.match(
    /<clarifications>([\s\S]*?)<\/clarifications>/
  )

  if (clarificationsMatch) {
    const itemMatches = clarificationsMatch[1].matchAll(
      /<item>[\s\S]*?<type>(.*?)<\/type>[\s\S]*?<content>([\s\S]*?)<\/content>(?:[\s\S]*?<options>([\s\S]*?)<\/options>)?[\s\S]*?<\/item>/g
    )

    for (const match of itemMatches) {
      const [_, type, content, optionsString] = match
      const options = optionsString
        ? optionsString
            .match(/<option>(.*?)<\/option>/g)
            ?.map(option => option.replace(/<\/?option>/g, "").trim())
        : undefined

      clarifications.push({
        type: type.trim() as AIClarificationItem["type"],
        content: content.trim(),
        options
      })
    }
  }

  return { clarifications }
}
