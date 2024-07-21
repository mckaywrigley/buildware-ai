import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { generatePR } from "@/actions/github/generate-pr"
import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import {
  createIssueMessage,
  deleteIssueMessagesByIssueId,
  updateIssue
} from "@/db/queries"
import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import {
  BUILDWARE_ACT_LLM,
  BUILDWARE_CLARIFY_LLM,
  BUILDWARE_PLAN_LLM,
  BUILDWARE_THINK_LLM
} from "@/lib/constants/buildware-config"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { Dispatch } from "react"
import { buildCodegenActPrompt } from "../ai/codegen-system/act/build-codegen-act-prompt"
import { parseCodegenActResponse } from "../ai/codegen-system/act/parse-codegen-act-response"
import { buildCodegenClarifyPrompt } from "../ai/codegen-system/clarify/build-codegen-clarify-prompt"
import { parseCodegenClarifyResponse } from "../ai/codegen-system/clarify/parse-codegen-clarify-response"
import { buildCodegenPlanPrompt } from "../ai/codegen-system/plan/build-codegen-plan-prompt"
import { parseCodegenPlanResponse } from "../ai/codegen-system/plan/parse-codegen-plan-response"
import { buildCodegenThinkPrompt } from "../ai/codegen-system/think/build-codegen-think-prompt"
import { parseCodegenThinkResponse } from "../ai/codegen-system/think/parse-codegen-think-response"

interface RunIssueWorkflowParams {
  issue: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
  setCurrentStep: (
    step:
      | "started"
      | "embedding"
      | "retrieval"
      | "clarify"
      | "think"
      | "plan"
      | "act"
      | "verify"
      | "pr"
      | "completed"
      | null
  ) => void
  setMessages: Dispatch<React.SetStateAction<SelectIssueMessage[]>>
  setClarifications: (clarifications: AIClarificationItem[]) => void
  setThoughts: (thoughts: AIThought[]) => void
  setPlanSteps: (planSteps: AIPlanStep[]) => void
  setGeneratedFiles: (files: AIFileInfo[]) => void
}

export const runIssueWorkflow = async ({
  issue,
  project,
  attachedInstructions,
  setCurrentStep,
  setMessages,
  setClarifications,
  setThoughts,
  setPlanSteps,
  setGeneratedFiles
}: RunIssueWorkflowParams) => {
  if (!project.githubRepoFullName || !project.githubTargetBranch) {
    alert("Project has no target branch configured.")
    return
  }

  try {
    // RESET
    await deleteIssueMessagesByIssueId(issue.id)
    setMessages([])

    // STARTED
    setCurrentStep("started")
    await updateIssue(issue.id, { status: "started" })
    const startedMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Issue run started."
    })
    setMessages(prev => [...prev, startedMessage])

    // EMBEDDING
    setCurrentStep("embedding")
    await updateIssue(issue.id, { status: "embedding" })
    const embeddingMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Embedding target branch..."
    })
    setMessages(prev => [...prev, embeddingMessage])
    await embedTargetBranch({
      projectId: project.id,
      githubRepoFullName: project.githubRepoFullName,
      branchName: project.githubTargetBranch,
      installationId: project.githubInstallationId
    })

    // RETRIEVAL
    setCurrentStep("retrieval")
    await updateIssue(issue.id, { status: "retrieval" })
    const retrievalMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Retrieving relevant codebase files..."
    })
    setMessages(prev => [...prev, retrievalMessage])
    const embeddingsQueryText = `${issue.name} ${issue.content}`
    const codebaseFiles = await getMostSimilarEmbeddedFiles(
      embeddingsQueryText,
      project.id
    )
    const instructionsContext = attachedInstructions
      .map(
        ({ instruction }) =>
          `<instruction name="${instruction.name}">\n${instruction.content}\n</instruction>`
      )
      .join("\n\n")

    // CLARIFY
    setCurrentStep("clarify")
    await updateIssue(issue.id, { status: "clarify" })
    const clarifyStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Clarifying issue..."
    })
    setMessages(prev => [...prev, clarifyStatusMessage])

    const {
      systemPrompt: clarifySystemPrompt,
      userMessage: clarifyUserMessage
    } = await buildCodegenClarifyPrompt({
      issue: {
        name: issue.name,
        description: issue.content
      },
      codebaseFiles: codebaseFiles.map(({ path, content }) => ({
        path,
        content: content || ""
      })),
      instructionsContext
    })

    const clarifyAIResponse = await generateCodegenAIMessage({
      system: clarifySystemPrompt,
      messages: [{ role: "user", content: clarifyUserMessage }],
      model: BUILDWARE_CLARIFY_LLM
    })

    const clarifyAIMessage = await createIssueMessage({
      issueId: issue.id,
      content: clarifyAIResponse
    })
    setMessages(prev => [...prev, clarifyAIMessage])

    const parsedClarifyResponse = parseCodegenClarifyResponse(clarifyAIResponse)
    setClarifications(parsedClarifyResponse.clarifications)

    await saveCodegenEval(
      `${clarifySystemPrompt}\n\n${clarifyUserMessage}`,
      issue.name,
      "clarify",
      "prompt"
    )
    await saveCodegenEval(clarifyAIResponse, issue.name, "clarify", "response")

    // THINK
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
        codebaseFiles: codebaseFiles.map(({ path, content }) => ({
          path,
          content: content || ""
        })),
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

    // PLAN
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
        codebaseFiles: codebaseFiles.map(({ path, content }) => ({
          path,
          content: content || ""
        })),
        instructionsContext,
        thinkPrompt: thinkAIResponse
      })

    const planAIResponse = await generateCodegenAIMessage({
      system: planSystemPrompt,
      messages: [{ role: "user", content: planUserMessage }],
      model: BUILDWARE_PLAN_LLM
    })

    const planAIMessage = await createIssueMessage({
      issueId: issue.id,
      content: planAIResponse
    })
    setMessages(prev => [...prev, planAIMessage])

    const parsedPlanResponse = parseCodegenPlanResponse(planAIResponse)
    setPlanSteps(parsedPlanResponse.steps)

    await saveCodegenEval(
      `${planSystemPrompt}\n\n${planUserMessage}`,
      issue.name,
      "plan",
      "prompt"
    )
    await saveCodegenEval(planAIResponse, issue.name, "plan", "response")

    // ACT
    setCurrentStep("act")
    await updateIssue(issue.id, { status: "act" })
    const actStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Acting on issue..."
    })
    setMessages(prev => [...prev, actStatusMessage])

    const { systemPrompt: actSystemPrompt, userMessage: actUserMessage } =
      await buildCodegenActPrompt({
        issue: { name: issue.name, description: issue.content },
        codebaseFiles: codebaseFiles.map(({ path, content }) => ({
          path,
          content: content || ""
        })),
        instructionsContext,
        planPrompt: planAIResponse
      })

    const actAIResponse = await generateCodegenAIMessage({
      system: actSystemPrompt,
      messages: [{ role: "user", content: actUserMessage }],
      model: BUILDWARE_ACT_LLM
    })

    const actAIMessage = await createIssueMessage({
      issueId: issue.id,
      content: actAIResponse
    })
    setMessages(prev => [...prev, actAIMessage])

    const parsedActResponse = parseCodegenActResponse(actAIResponse)
    setGeneratedFiles(parsedActResponse.files)

    await saveCodegenEval(
      `${actSystemPrompt}\n\n${actUserMessage}`,
      issue.name,
      "act",
      "prompt"
    )
    await saveCodegenEval(actAIResponse, issue.name, "act", "response")

    // PULL REQUEST
    setCurrentStep("pr")
    await updateIssue(issue.id, { status: "pr" })
    const prStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Creating pull request..."
    })
    setMessages(prev => [...prev, prStatusMessage])

    const { prLink, branchName } = await generatePR(
      issue.name,
      project,
      parsedActResponse
    )

    const prCreatedMessage = await createIssueMessage({
      issueId: issue.id,
      content: `Pull request created successfully!\n\nBranch: ${branchName}\nPR Link: ${prLink}`
    })
    setMessages(prev => [...prev, prCreatedMessage])

    // Update issue with PR link
    await updateIssue(issue.id, { prLink })

    // COMPLETED
    setCurrentStep("completed")
    await updateIssue(issue.id, { status: "completed" })
    const completedStatusMessage = await createIssueMessage({
      issueId: issue.id,
      content: "Issue run completed!"
    })
    setMessages(prev => [...prev, completedStatusMessage])
  } catch (error) {
    console.error("Error running issue:", error)
    await updateIssue(issue.id, { status: "failed" })
    throw error
  }
}
