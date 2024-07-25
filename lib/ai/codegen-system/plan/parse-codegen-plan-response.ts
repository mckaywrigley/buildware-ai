import { AIParsedPlanResponse, AIPlanStep } from "@/types/ai"

export function parseCodegenPlanResponse(
  response: string
): AIParsedPlanResponse {
  const steps: AIPlanStep[] = []
  const stepsMatch = response.match(/<steps>([\s\S]*?)<\/steps>/)

  if (stepsMatch) {
    const stepMatches = stepsMatch[1].matchAll(
      /<step>[\s\S]*?<step_number>(.*?)<\/step_number>[\s\S]*?<step_text>([\s\S]*?)<\/step_text>[\s\S]*?<\/step>/g
    )

    for (const match of stepMatches) {
      const [_, number, text] = match
      steps.push({
        number: parseInt(number.trim()),
        text: text.trim()
      })
    }
  }

  return { steps }
}
