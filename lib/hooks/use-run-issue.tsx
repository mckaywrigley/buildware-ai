"use client"

import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { RunStep } from "@/types/run"
import { useState } from "react"
import { parseCodegenActResponse } from "../ai/codegen-system/act/parse-codegen-act-response"
import { parseCodegenThinkResponse } from "../ai/codegen-system/think/parse-codegen-think-response"
import { MOCK_THINK_DATA } from "../constants/codegen-mock-data/think/mock-think-data"
import { runActStep } from "../runs/run-act-step"
import { runClarifyStep } from "../runs/run-clarify-step"
import { runCompletedStep } from "../runs/run-completed-step"
import { runEmbeddingStep } from "../runs/run-embedding-step"
import { runPlanStep } from "../runs/run-plan-step"
import { runPRStep } from "../runs/run-pr-step"
import { runRetrievalStep } from "../runs/run-retrieval-step"
import { runStartStep } from "../runs/run-start-step"
import { runThinkStep } from "../runs/run-think-step"
import { runVerifyStep } from "../runs/run-verify-step"

export const useRunIssue = (
  issue: SelectIssue,
  initialIssueMessages: SelectIssueMessage[],
  project: SelectProject,
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<RunStep>("think")
  const [messages, setMessages] =
    useState<SelectIssueMessage[]>(initialIssueMessages)
  const [clarifications, setClarifications] = useState<AIClarificationItem[]>(
    []
  )
  const [thoughts, setThoughts] = useState<AIThought[]>(
    parseCodegenThinkResponse(MOCK_THINK_DATA).thoughts
  )
  const [planSteps, setPlanSteps] = useState<AIPlanStep[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<AIFileInfo[]>([])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [codebaseFiles, setCodebaseFiles] = useState<
    { path: string; content: string }[]
  >([])
  const [instructionsContext, setInstructionsContext] = useState("")
  const [aiResponses, setAIResponses] = useState<{
    clarify: string | null
    think: string | null
    plan: string | null
    act: string | null
  }>({
    clarify: null,
    think: null,
    plan: null,
    act: null
  })
  const steps = [
    runStartStep,
    runEmbeddingStep,
    runRetrievalStep,
    runClarifyStep,
    runThinkStep,
    runPlanStep,
    runActStep,
    runPRStep,
    runVerifyStep,
    runCompletedStep
  ]

  const runNextStep = async () => {
    if (currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex]
      await currentStep({
        issue,
        project,
        attachedInstructions,
        setCurrentStep,
        setMessages,
        setClarifications,
        setThoughts,
        setPlanSteps,
        setGeneratedFiles,
        codebaseFiles,
        instructionsContext,
        clarifyAIResponse: aiResponses.clarify ?? "",
        thinkAIResponse: aiResponses.think ?? "",
        planAIResponse: aiResponses.plan ?? "",
        actAIResponse: aiResponses.act ?? "",
        parsedActResponse: aiResponses.act
          ? parseCodegenActResponse(aiResponses.act)
          : null,
        setCodebaseFiles,
        setInstructionsContext,
        setAIResponses: (type: keyof typeof aiResponses, response: string) =>
          setAIResponses(prev => ({ ...prev, [type]: response }))
      })
      setCurrentStepIndex(prevIndex => prevIndex + 1)
    }
  }

  const handleRun = async () => {
    if (!project.githubRepoFullName || !project.githubTargetBranch) {
      alert("Please connect your project to a GitHub repository first.")
      return
    }

    setIsRunning(true)
    try {
      await runNextStep()
    } catch (error) {
      console.error("Error running issue:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return {
    isRunning,
    currentStep,
    messages,
    clarifications,
    thoughts,
    planSteps,
    generatedFiles,
    handleRun,
    setThoughts,
    setClarifications,
    setPlanSteps,
    setGeneratedFiles,
    setCurrentStep
  }
}
