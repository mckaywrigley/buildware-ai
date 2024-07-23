import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { createIssueMessage, updateIssue } from "@/db/queries"
import { buildCodegenThinkPrompt } from "@/lib/ai/codegen-system/think/build-codegen-think-prompt"
import { parseCodegenThinkResponse } from "@/lib/ai/codegen-system/think/parse-codegen-think-response"
import { BUILDWARE_THINK_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"

export const runThinkStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  setCurrentStep,
  setMessages,
  setThoughts
}: RunStepParams) => {
  try {
    setCurrentStep("think")
    await updateIssue(issue.id, { status: "think" })
    const thinkStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Thinking about issue..."
    })
    setMessages(prev => [...prev, thinkStatusMessage])

    const { systemPrompt: thinkSystemPrompt, userMessage: thinkUserMessage } =
      await buildCodegenThinkPrompt({
        issue: { name: issue.name, description: issue.content },
        codebaseFiles,
        instructionsContext
      })

    const thinkAIResponse = await generateCodegenAIMessage({
      system: thinkSystemPrompt,
      messages: [{ role: "user", content: thinkUserMessage }],
      model: BUILDWARE_THINK_LLM
    })

    const thinkAIMessage = await createIssueMessage({
      issueId: issue.id,
      content: thinkAIResponse
    })
    setMessages(prev => [...prev, thinkAIMessage])

    const parsedThinkResponse = parseCodegenThinkResponse(thinkAIResponse)
    setThoughts(parsedThinkResponse.thoughts)

    await saveCodegenEval(
      `${thinkSystemPrompt}\n\n${thinkUserMessage}`,
      issue.name,
      "think",
      "prompt"
    )
    await saveCodegenEval(thinkAIResponse, issue.name, "think", "response")

    return { thinkAIResponse }
  } catch (error) {
    console.error("Error running think step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
