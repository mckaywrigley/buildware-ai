import { generateRunResponse } from "@/actions/ai/generate-run-response"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { BUILDWARE_SPECIFICATION_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"
import { parseSpecificationResponse } from "../ai/run-system/specification/specification-parser"
import {
  buildSpecificationPrompt,
  SPECIFICATION_PREFILL
} from "../ai/run-system/specification/specification-prompt"

export const runSpecificationStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  setSpecificationResponse,
  setParsedSpecification
}: RunStepParams) => {
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

    setSpecificationResponse(specificationResponse)
    setParsedSpecification(parsedSpecification)

    await saveCodegenEval(
      `${specificationSystemPrompt}\n\n${specificationUserMessage}`,
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
  } catch (error) {
    console.error("Error running specification step:", error)
    throw error
  }
}
