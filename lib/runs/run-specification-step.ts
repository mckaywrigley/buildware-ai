import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { BUILDWARE_SPECIFICATION_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"
import {
  isSpecificationComplete,
  parseSpecificationResponse
} from "../ai/run-system/specification/specification-parser"
import {
  buildSpecificationPrompt,
  rebuildSpecificationPrompt,
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
      userMessage: specificationUserMessage
    } = await buildSpecificationPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext
    })

    let specificationResponse = ""
    let isComplete = false

    while (!isComplete) {
      const partialResponse = await generateCodegenAIMessage({
        system: specificationSystemPrompt,
        messages: [{ role: "user", content: specificationUserMessage }],
        model: BUILDWARE_SPECIFICATION_LLM,
        prefill: SPECIFICATION_PREFILL
      })

      specificationResponse += partialResponse
      isComplete = isSpecificationComplete(specificationResponse)

      if (!isComplete) {
        ;({
          systemPrompt: specificationSystemPrompt,
          userMessage: specificationUserMessage
        } = await rebuildSpecificationPrompt({
          prevUserMessage: specificationUserMessage,
          partialResponse: specificationResponse,
          codebaseFiles,
          issue: { name: issue.name, description: issue.content },
          instructionsContext
        }))
      }
    }

    const parsedSpecification = parseSpecificationResponse(
      SPECIFICATION_PREFILL + specificationResponse
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
