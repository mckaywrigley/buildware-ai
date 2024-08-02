import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
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
    const {
      systemPrompt: implementationSystemPrompt,
      userMessage: implementationUserMessage
    } = await buildImplementationPrompt({
      issue: { name: issue.name, description: issue.content },
      codebaseFiles,
      instructionsContext,
      plan: planResponse
    })

    const implementationResponse = await generateCodegenAIMessage({
      system: implementationSystemPrompt,
      messages: [{ role: "user", content: implementationUserMessage }],
      model: BUILDWARE_IMPLEMENTATION_LLM,
      prefill: IMPLEMENTATION_PREFILL
    })

    const parsedImplementation = parseImplementationResponse(
      IMPLEMENTATION_PREFILL + implementationResponse
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
