import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { updateIssue } from "@/db/queries"
import { buildCodegenClarifyPrompt } from "@/lib/ai/codegen-system/clarify/build-codegen-clarify-prompt"
import { parseCodegenClarifyResponse } from "@/lib/ai/codegen-system/clarify/parse-codegen-clarify-response"
import { BUILDWARE_CLARIFY_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"
import console from "console"

export const runClarifyStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  setCurrentStep,
  setClarifications
}: RunStepParams) => {
  try {
    setCurrentStep("clarify")
    await updateIssue(issue.id, { status: "clarify" })

    const {
      systemPrompt: clarifySystemPrompt,
      userMessage: clarifyUserMessage
    } = await buildCodegenClarifyPrompt({
      issue: {
        name: issue.name,
        description: issue.content
      },
      codebaseFiles,
      instructionsContext
    })

    const clarifyAIResponse = await generateCodegenAIMessage({
      system: clarifySystemPrompt,
      messages: [{ role: "user", content: clarifyUserMessage }],
      model: BUILDWARE_CLARIFY_LLM
    })

    const parsedClarifyResponse = parseCodegenClarifyResponse(clarifyAIResponse)
    setClarifications(parsedClarifyResponse.clarifications)

    await saveCodegenEval(
      `${clarifySystemPrompt}\n\n${clarifyUserMessage}`,
      issue.name,
      "clarify",
      "prompt"
    )
    await saveCodegenEval(clarifyAIResponse, issue.name, "clarify", "response")
  } catch (error) {
    console.error("Error running clarify step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
