import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { updateIssue } from "@/db/queries"
import { buildCodegenActPrompt } from "@/lib/ai/codegen-system/act/build-codegen-act-prompt"
import { parseCodegenActResponse } from "@/lib/ai/codegen-system/act/parse-codegen-act-response"
import { BUILDWARE_ACT_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"

export const runActStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  planAIResponse,
  setCurrentStep,
  setGeneratedFiles,
  setAIResponses
}: RunStepParams) => {
  try {
    setCurrentStep("act")
    await updateIssue(issue.id, { status: "act" })

    const { systemPrompt: actSystemPrompt, userMessage: actUserMessage } =
      await buildCodegenActPrompt({
        issue: { name: issue.name, description: issue.content },
        codebaseFiles,
        instructionsContext,
        planPrompt: planAIResponse
      })

    const actAIResponse = await generateCodegenAIMessage({
      system: actSystemPrompt,
      messages: [{ role: "user", content: actUserMessage }],
      model: BUILDWARE_ACT_LLM
    })
    setAIResponses("act", actAIResponse)

    const parsedActResponse = parseCodegenActResponse(actAIResponse)
    setGeneratedFiles(parsedActResponse.files)

    await saveCodegenEval(
      `${actSystemPrompt}\n\n${actUserMessage}`,
      issue.name,
      "act",
      "prompt"
    )
    await saveCodegenEval(actAIResponse, issue.name, "act", "response")

    return { parsedActResponse }
  } catch (error) {
    console.error("Error running act step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
