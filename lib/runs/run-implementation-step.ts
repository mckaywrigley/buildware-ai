import { generateRunResponse } from "@/actions/ai/generate-run-response"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { SelectIssue } from "@/db/schema"
import { BUILDWARE_IMPLEMENTATION_LLM } from "@/lib/constants/buildware-config"
import { parseImplementationResponse } from "../ai/run-system/implementation/implementation-parser"
import {
  buildImplementationPrompt,
  IMPLEMENTATION_PREFILL
} from "../ai/run-system/implementation/implementation-prompt"
import { updateRunStep } from "@/actions/runs/manage-runs"
import { calculateAndStoreCost } from "@/actions/ai/calculate-llm-cost"

export const runImplementationStep = async ({
  runId,
  issue,
  codebaseFiles,
  instructionsContext,
  plan
}: {
  runId: string,
  issue: SelectIssue
  codebaseFiles: { path: string; content: string }[]
  instructionsContext: string
  plan: string
}) => {
  try {
    let {
      systemPrompt: implementationSystemPrompt,
      userMessage: implementationUserMessage,
      prefill
    } = await buildImplementationPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext,
      plan
    })

    let implementationResponse = IMPLEMENTATION_PREFILL
    let isComplete = false

    while (!isComplete) {
      const { content: partialResponse, isComplete: partialIsComplete } =
        await generateRunResponse({
          system: implementationSystemPrompt,
          messages: [{ role: "user", content: implementationUserMessage }],
          model: BUILDWARE_IMPLEMENTATION_LLM,
          prefill
        })

      implementationResponse += partialResponse
      isComplete = partialIsComplete

      if (!isComplete) {
        const updatedPrompt = await buildImplementationPrompt({
          partialResponse: implementationResponse,
          issue: { name: issue.name, description: issue.content },
          codebaseFiles,
          instructionsContext,
          plan
        })

        implementationSystemPrompt = updatedPrompt.systemPrompt
        implementationUserMessage = updatedPrompt.userMessage
        prefill = updatedPrompt.prefill
      }
    }

    const parsedImplementation = parseImplementationResponse(
      implementationResponse
    )

    await saveCodegenEval(
      `${implementationSystemPrompt}

${implementationUserMessage}`,
      issue.name,
      "implementation",
      "prompt"
    )
    await saveCodegenEval(
      implementationResponse,
      issue.name,
      "implementation",
      "response"
    )

    const cost = await calculateAndStoreCost(
      runId,
      "implementation",
      BUILDWARE_IMPLEMENTATION_LLM,
      implementationSystemPrompt.length + implementationUserMessage.length,
      implementationResponse.length
    )

    await updateRunStep(runId, "implementation", "completed", cost.toString(), JSON.stringify(parsedImplementation))

    return {
      implementationResponse,
      parsedImplementation
    }
  } catch (error) {
    console.error("Error running implementation step:", error)
    throw error
  }
}