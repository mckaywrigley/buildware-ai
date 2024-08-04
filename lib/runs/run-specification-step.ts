import { generateRunResponse } from "@/actions/ai/generate-run-response"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { SelectIssue } from "@/db/schema"
import { BUILDWARE_SPECIFICATION_LLM } from "@/lib/constants/buildware-config"
import { parseSpecificationResponse } from "../ai/run-system/specification/specification-parser"
import {
  buildSpecificationPrompt,
  SPECIFICATION_PREFILL
} from "../ai/run-system/specification/specification-prompt"
import { updateRunStep } from "@/actions/runs/manage-runs"
import { calculateAndStoreCost } from "@/actions/ai/calculate-llm-cost"

export const runSpecificationStep = async ({
  runId,
  issue,
  codebaseFiles,
  instructionsContext
}: {
  runId: string,
  issue: SelectIssue
  codebaseFiles: { path: string; content: string }[]
  instructionsContext: string
}) => {
  try {
    let {
      systemPrompt: specificationSystemPrompt,
      userMessage: specificationUserMessage,
      prefill
    } = await buildSpecificationPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext
    })

    let specificationResponse = SPECIFICATION_PREFILL
    let isComplete = false

    while (!isComplete) {
      const { content: partialResponse, isComplete: partialIsComplete } =
        await generateRunResponse({
          system: specificationSystemPrompt,
          messages: [{ role: "user", content: specificationUserMessage }],
          model: BUILDWARE_SPECIFICATION_LLM,
          prefill
        })

      specificationResponse += partialResponse
      isComplete = partialIsComplete

      if (!isComplete) {
        const updatedPrompt = await buildSpecificationPrompt({
          partialResponse: specificationResponse,
          codebaseFiles,
          issue: { name: issue.name, description: issue.content },
          instructionsContext
        })

        specificationSystemPrompt = updatedPrompt.systemPrompt
        specificationUserMessage = updatedPrompt.userMessage
        prefill = updatedPrompt.prefill
      }
    }

    const parsedSpecification = parseSpecificationResponse(
      specificationResponse
    )

    await saveCodegenEval(
      `${specificationSystemPrompt}

${specificationUserMessage}`,
      issue.name,
      "specification",
      "prompt"
    )
    await saveCodegenEval(
      specificationResponse,
      issue.name,
      "specification",
      "response"
    )

    const cost = await calculateAndStoreCost(
      runId,
      "specification",
      BUILDWARE_SPECIFICATION_LLM,
      specificationSystemPrompt.length + specificationUserMessage.length,
      specificationResponse.length
    )

    await updateRunStep(runId, "specification", "completed", cost.toString(), JSON.stringify(parsedSpecification))

    return {
      specificationResponse,
      parsedSpecification
    }
  } catch (error) {
    console.error("Error running specification step:", error)
    throw error
  }
}