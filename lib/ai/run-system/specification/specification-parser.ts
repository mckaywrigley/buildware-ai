import { ParsedSpecification, SpecificationStep } from "@/types/run"

export function parseSpecificationResponse(response: string) {
  const steps: SpecificationStep[] = []
  const specificationMatch = response.match(
    /<specification>([\s\S]*?)(<\/specification>|$)/
  )

  if (specificationMatch) {
    const stepMatches = specificationMatch[1].matchAll(
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

export const isSpecificationComplete = (response: string): boolean => {
  const trimmedResponse = response.trim()
  return trimmedResponse.endsWith("</specification>")
}
