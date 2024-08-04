import { generateRunResponse } from "@/actions/ai/generate-run-response"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { SelectIssue } from "@/db/schema"
import { BUILDWARE_PLAN_LLM } from "@/lib/constants/buildware-config"
import { parsePlanResponse } from "../ai/run-system/plan/plan-parser"
import {
  buildPlanPrompt,
  PLAN_PREFILL
} from "../ai/run-system/plan/plan-prompt"
import { updateRunStep } from "@/actions/runs/manage-runs"
import { calculateAndStoreCost } from "@/actions/ai/calculate-llm-cost"

export const runPlanStep = async ({
  runId,
  issue,
  codebaseFiles,
  instructionsContext,
  specification
}: {
  runId: string,
  issue: SelectIssue
  codebaseFiles: { path: string; content: string }[]
  instructionsContext: string
  specification: string
}) => {
  try {
    let {
      systemPrompt: planSystemPrompt,
      userMessage: planUserMessage,
      prefill
    } = await buildPlanPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext,
      specification
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
          specification
        })

        planSystemPrompt = updatedPrompt.systemPrompt
        planUserMessage = updatedPrompt.userMessage
        prefill = updatedPrompt.prefill
      }
    }

    const parsedPlan = parsePlanResponse(planResponse)

    await saveCodegenEval(
      `${planSystemPrompt}

${planUserMessage}`,
      issue.name,
      "plan",
      "prompt"
    )
    await saveCodegenEval(planResponse, issue.name, "plan", "response")

    const cost = await calculateAndStoreCost(
      runId,
      "plan",
      BUILDWARE_PLAN_LLM,
      planSystemPrompt.length + planUserMessage.length,
      planResponse.length
    )

    await updateRunStep(runId, "plan", "completed", cost.toString(), JSON.stringify(parsedPlan))

    return {
      planResponse,
      parsedPlan
    }
  } catch (error) {
    console.error("Error running plan step:", error)
    throw error
  }
}