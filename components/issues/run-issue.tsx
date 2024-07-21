"use client"

import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { generatePR } from "@/actions/github/generate-pr"
import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { CodegenThoughts } from "@/components/codegen/think/codegen-thoughts"
import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
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
import { buildCodegenActPrompt } from "@/lib/ai/codegen-system/act/build-codegen-act-prompt"
import { parseCodegenActResponse } from "@/lib/ai/codegen-system/act/parse-codegen-act-response"
import { buildCodegenClarifyPrompt } from "@/lib/ai/codegen-system/clarify/build-codegen-clarify-prompt"
import { parseCodegenClarifyResponse } from "@/lib/ai/codegen-system/clarify/parse-codegen-clarify-response"
import { buildCodegenPlanPrompt } from "@/lib/ai/codegen-system/plan/build-codegen-plan-prompt"
import { parseCodegenPlanResponse } from "@/lib/ai/codegen-system/plan/parse-codegen-plan-response"
import { buildCodegenThinkPrompt } from "@/lib/ai/codegen-system/think/build-codegen-think-prompt"
import { parseCodegenThinkResponse } from "@/lib/ai/codegen-system/think/parse-codegen-think-response"
import {
  BUILDWARE_ACT_LLM,
  BUILDWARE_CLARIFY_LLM,
  BUILDWARE_PLAN_LLM,
  BUILDWARE_THINK_LLM
} from "@/lib/constants/buildware-config"
import { MOCK_THINK_DATA } from "@/lib/constants/codegen-mock-data/think/mock-think-data"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { Loader2, Play, RefreshCw } from "lucide-react"
import { FC, useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"

interface RunIssueProps {
  issue: SelectIssue
  initialIssueMessages: SelectIssueMessage[]
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
}

export const RunIssue: FC<RunIssueProps> = ({
  issue,
  initialIssueMessages,
  project,
  attachedInstructions
}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<
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
  >("started")
  const [messages, setMessages] = useState(initialIssueMessages)
  const [clarifications, setClarifications] = useState<AIClarificationItem[]>(
    []
  )
  const [thoughts, setThoughts] = useState<AIThought[]>([])
  const [planSteps, setPlanSteps] = useState<AIPlanStep[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<AIFileInfo[]>([])

  const handleRun = async () => {
    if (!project.githubRepoFullName || !project.githubTargetBranch) {
      alert("Please connect your project to a GitHub repository first.")
      return
    }

    try {
      // RESET --------------------
      await deleteIssueMessagesByIssueId(issue.id)
      setMessages([])

      // STARTED --------------------
      setIsRunning(true)
      await updateIssue(issue.id, { status: "started" })
      const startedMessage = await createIssueMessage({
        issueId: issue.id,
        content: "Issue run started."
      })
      setMessages(prev => [...prev, startedMessage])

      // EMBEDDING --------------------
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

      // RETRIEVAL --------------------
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

      // CLARIFY --------------------
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

      const parsedClarifyResponse =
        parseCodegenClarifyResponse(clarifyAIResponse)
      setClarifications(parsedClarifyResponse.clarifications)

      await saveCodegenEval(
        `${clarifySystemPrompt}\n\n${clarifyUserMessage}`,
        issue.name,
        "clarify",
        "prompt"
      )
      await saveCodegenEval(
        clarifyAIResponse,
        issue.name,
        "clarify",
        "response"
      )

      // THINK --------------------
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

      // PLAN --------------------
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

      // ACT --------------------
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

      // // VERIFY --------------------
      // setCurrentStep("verify")
      // await updateIssue(issue.id, { status: "verify" })
      // const verifyStatusMessage = await createIssueMessage({
      //   issueId: issue.id,
      //   content: "Verifying issue..."
      // })
      // setMessages(prev => [...prev, verifyStatusMessage])

      // const {
      //   systemPrompt: verifySystemPrompt,
      //   userMessage: verifyUserMessage
      // } = await buildCodegenVerifyPrompt({
      //   issue: { name: issue.name, description: issue.content },
      //   codebaseFiles,
      //   instructionsContext,
      //   clarifications: parsedClarifyResponse.clarifications,
      //   thoughts: parsedThinkResponse.thoughts,
      //   fileInfo: parsedThinkResponse.fileInfo,
      //   planSteps: parsedPlanResponse.planSteps
      // })

      // const verifyAIResponse = await generateCodegenAIMessage({
      //   system: verifySystemPrompt,
      //   messages: [{ role: "user", content: verifyUserMessage }],
      //   model: BUILDWARE_VERIFY_LLM
      // })

      // const verifyAIMessage = await createIssueMessage({
      //   issueId: issue.id,
      //   content: verifyAIResponse
      // })
      // setMessages(prev => [...prev, verifyAIMessage])

      // await saveCodegenEval(
      //   `${verifySystemPrompt}\n\n${verifyUserMessage}`,
      //   issue.name,
      //   "verify",
      //   "prompt"
      // )
      // await saveCodegenEval(verifyAIResponse, issue.name, "verify", "response")

      // PULL REQUEST --------------------
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

      setCurrentStep("completed")

      // COMPLETED --------------------
      await updateIssue(issue.id, { status: "completed" })
      const completedStatusMessage = await createIssueMessage({
        issueId: issue.id,
        content: "Issue run completed!"
      })
      setMessages(prev => [...prev, completedStatusMessage])
    } catch (error) {
      console.error("Error running issue:", error)
      await updateIssue(issue.id, { status: "failed" })
    } finally {
      setIsRunning(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "started":
        return <div>Started step content</div>
      case "embedding":
        return <div>Embedding step content</div>
      case "retrieval":
        return <div>Retrieval step content</div>
      case "clarify":
        return <div>Clarification step content</div>
      case "think":
        return (
          <CodegenThoughts
            response={MOCK_THINK_DATA} // TODO: Replace with parsed thinkAIResponse
            onUpdate={updatedThoughts => {
              console.log("Updated thoughts:", updatedThoughts)
            }}
          />
        )
      case "plan":
        return <div>Planning step content</div>
      case "act":
        return <div>Action step content</div>
      case "verify":
        return <div>Verification step content</div>
      case "pr":
        return <div>Pull request step content</div>
      case "completed":
        return <div>Completed step content</div>
      default:
        return null
    }
  }

  return (
    <CRUDPage
      pageTitle={`Running issue`}
      backText="Back to issue"
      backLink={`./`}
    >
      <div className="flex flex-col gap-12">
        <Button variant="create" onClick={handleRun} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Running...
            </>
          ) : issue.status === "completed" ? (
            <>
              <RefreshCw className="mr-2 size-4" />
              Redo Run
            </>
          ) : (
            <>
              <Play className="mr-2 size-4" />
              Start Run
            </>
          )}
        </Button>

        <Card className="bg-secondary/50 flex flex-col gap-2 p-4">
          <CardTitle>{issue.name}</CardTitle>

          <CardContent className="p-0">
            <MessageMarkdown content={issue.content} />
          </CardContent>
        </Card>

        {currentStep && <div className="mb-6">{renderStepContent()}</div>}

        <div className="space-y-8">
          {messages.map(message => (
            <Card key={message.id}>
              <CardContent className="bg-secondary p-4">
                <MessageMarkdown content={message.content} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CRUDPage>
  )
}
