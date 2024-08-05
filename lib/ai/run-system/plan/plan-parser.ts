import { ParsedPlan, PlanStep } from "@/types/run"

export function parsePlanResponse(response: string) {
  const steps: PlanStep[] = []
  const planMatch = response.match(/<plan>([\s\S]*?)(<\/plan>|$)/)

  if (planMatch) {
    const cleanedPlan = planMatch[1].replace(
      /<scratchpad>[\s\S]*?<\/scratchpad>/g,
      ""
    )

    const stepMatches = cleanedPlan.matchAll(/<step>([\s\S]*?)<\/step>/g)

    for (const match of stepMatches) {
      steps.push({
        text: match[1].trim()
      })
    }
  }

  const parsedPlan: ParsedPlan = {
    steps
  }

  return parsedPlan
}
