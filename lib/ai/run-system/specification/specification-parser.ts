import { ParsedSpecification, SpecificationStep } from "@/types/run"

export function parseSpecificationResponse(response: string) {
  const steps: SpecificationStep[] = []
  const specificationMatch = response.match(
    /<specification>([\s\S]*?)(<\/specification>|$)/
  )

  if (specificationMatch) {
    const cleanedSpecification = specificationMatch[1].replace(
      /<scratchpad>[\s\S]*?<\/scratchpad>/g,
      ""
    )

    const stepMatches = cleanedSpecification.matchAll(
      /<step>([\s\S]*?)<\/step>/g
    )

    for (const match of stepMatches) {
      steps.push({
        text: match[1].trim()
      })
    }
  }

  const parsedSpecification: ParsedSpecification = {
    steps
  }

  return parsedSpecification
}

export function removeScratchpadTags(response: string): string {
  return response.replace(/<scratchpad>[\s\S]*?<\/scratchpad>\s*/g, "")
}
