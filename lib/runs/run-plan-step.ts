import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { BUILDWARE_PLAN_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"
import { parsePlanResponse } from "../ai/run-system/plan/plan-parser"
import {
  buildPlanPrompt,
  PLAN_PREFILL
} from "../ai/run-system/plan/plan-prompt"

export const runPlanStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  specificationResponse,
  setParsedPlan,
  setPlanResponse
}: RunStepParams) => {
  try {
    const { systemPrompt: planSystemPrompt, userMessage: planUserMessage } =
      await buildPlanPrompt({
        issue: { name: issue.name, description: issue.content },
        codebaseFiles,
        instructionsContext,
        specification: specificationResponse
      })

    const planResponse = await generateCodegenAIMessage({
      system: planSystemPrompt,
      messages: [{ role: "user", content: planUserMessage }],
      model: BUILDWARE_PLAN_LLM,
      prefill: PLAN_PREFILL
    })

    const parsedPlan = parsePlanResponse(PLAN_PREFILL + planResponse)

    setPlanResponse(planResponse)
    setParsedPlan(parsedPlan)

    await saveCodegenEval(
      `${planSystemPrompt}\n\n${planUserMessage}`,
      issue.name,
      "plan",
      "prompt"
    )
    await saveCodegenEval(planResponse, issue.name, "plan", "response")
  } catch (error) {
    console.error("Error running plan step:", error)
    throw error
  }
}
