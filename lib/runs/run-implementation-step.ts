import { generateRunResponse } from "@/actions/ai/generate-run-response"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { BUILDWARE_IMPLEMENTATION_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"
import { parseImplementationResponse } from "../ai/run-system/implementation/implementation-parser"
import {
  buildImplementationPrompt,
  IMPLEMENTATION_PREFILL
} from "../ai/run-system/implementation/implementation-prompt"

export const runImplementationStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  planResponse,
  setImplementationResponse,
  setParsedImplementation
}: RunStepParams) => {
  try {
    let {
      systemPrompt: implementationSystemPrompt,
      userMessage: implementationUserMessage,
      prefill
    } = await buildImplementationPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext,
      plan: planResponse
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
          plan: planResponse
        })

        implementationSystemPrompt = updatedPrompt.systemPrompt
        implementationUserMessage = updatedPrompt.userMessage
        prefill = updatedPrompt.prefill
      }
    }

    const parsedImplementation = parseImplementationResponse(
      implementationResponse
    )

    setImplementationResponse(implementationResponse)
    setParsedImplementation(parsedImplementation)

    await saveCodegenEval(
      `${implementationSystemPrompt}\n\n${implementationUserMessage}`,
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
  } catch (error) {
    console.error("Error running implementation step:", error)
    throw error
  }
}
