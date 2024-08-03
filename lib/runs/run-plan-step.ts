import { generateRunResponse } from "@/actions/ai/generate-run-response"
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
    let {
      systemPrompt: planSystemPrompt,
      userMessage: planUserMessage,
      prefill
    } = await buildPlanPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext,
      specification: specificationResponse
    })

    let planResponse = PLAN_PREFILL
    let isComplete = false

    while (!isComplete) {
      const { content: partialResponse, isComplete: partialIsComplete } =
        await generateRunResponse({
          system: planSystemPrompt,
          messages: [{ role: "user", content: planUserMessage }],
          model: BUILDWARE_PLAN_LLM,
          prefill
        })

      planResponse += partialResponse
      isComplete = partialIsComplete

      if (!isComplete) {
        const updatedPrompt = await buildPlanPrompt({
          partialResponse: planResponse,
          issue: { name: issue.name, description: issue.content },
          codebaseFiles,
          instructionsContext,
          specification: specificationResponse
        })

        planSystemPrompt = updatedPrompt.systemPrompt
        planUserMessage = updatedPrompt.userMessage
        prefill = updatedPrompt.prefill
      }
    }

    const parsedPlan = parsePlanResponse(planResponse)

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
