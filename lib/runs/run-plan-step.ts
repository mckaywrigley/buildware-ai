import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import {
  createIssueMessage,
  updateIssue,
  updateIssueMessage
} from "@/db/queries"
import { buildCodegenPlanPrompt } from "@/lib/ai/codegen-system/plan/build-codegen-plan-prompt"
import { parseCodegenPlanResponse } from "@/lib/ai/codegen-system/plan/parse-codegen-plan-response"
import { BUILDWARE_PLAN_LLM } from "@/lib/constants/buildware-config"
import { RunStepParams } from "@/types/run"

export const runPlanStep = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  thinkAIResponse,
  setCurrentStep,
  setMessages,
  setPlanSteps
}: RunStepParams) => {
  try {
    setCurrentStep("plan")
    await updateIssue(issue.id, { status: "plan" })
    const planStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Planning issue..."
    })
    setMessages(prev => [...prev, planStatusMessage])

    const { systemPrompt: planSystemPrompt, userMessage: planUserMessage } =
      await buildCodegenPlanPrompt({
        issue: { name: issue.name, description: issue.content },
        codebaseFiles,
        instructionsContext,
        thinkPrompt: thinkAIResponse
      })

    const planAIResponse = await generateCodegenAIMessage({
      system: planSystemPrompt,
      messages: [{ role: "user", content: planUserMessage }],
      model: BUILDWARE_PLAN_LLM
    })

    const parsedPlanResponse = parseCodegenPlanResponse(planAIResponse)
    setPlanSteps(parsedPlanResponse.steps)

    await updateIssueMessage(planStatusMessage.id, {
      content: "Issue planned."
    })

    await saveCodegenEval(
      `${planSystemPrompt}\n\n${planUserMessage}`,
      issue.name,
      "plan",
      "prompt"
    )
    await saveCodegenEval(planAIResponse, issue.name, "plan", "response")

    return { planAIResponse }
  } catch (error) {
    console.error("Error running plan step:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
