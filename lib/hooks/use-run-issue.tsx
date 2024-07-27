"use client"

import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { RunStep, StepName, StepStatus } from "@/types/run"
import { useState } from "react"
import { parseCodegenActResponse } from "../ai/codegen-system/act/parse-codegen-act-response"
import { parseCodegenThinkResponse } from "../ai/codegen-system/think/parse-codegen-think-response"
import { MOCK_THINK_DATA } from "../constants/codegen-mock-data/think/mock-think-data"
import { runActStep } from "../runs/run-act-step"
import { runCompletedStep } from "../runs/run-completed-step"
import { runEmbeddingStep } from "../runs/run-embedding-step"
import { runPlanStep } from "../runs/run-plan-step"
import { runPRStep } from "../runs/run-pr-step"
import { runRetrievalStep } from "../runs/run-retrieval-step"
import { runStartStep } from "../runs/run-start-step"
import { runThinkStep } from "../runs/run-think-step"

export const useRunIssue = (
  issue: SelectIssue,
  project: SelectProject,
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepName | null>(null)
  const [clarifications, setClarifications] = useState<AIClarificationItem[]>(
    []
  )
  const [thoughts, setThoughts] = useState<AIThought[]>(
    parseCodegenThinkResponse(MOCK_THINK_DATA).thoughts
  )
  const [planSteps, setPlanSteps] = useState<AIPlanStep[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<AIFileInfo[]>([])
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
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

  const [steps, setSteps] = useState<RunStep>({
    started: "not_started",
    embedding: "not_started",
    retrieval: "not_started",
    think: "not_started",
    plan: "not_started",
    act: "not_started",
    pr: "not_started",
    completed: "not_started",
    // unimplemented steps
    clarify: "not_started",
    verify: "not_started"
  })

  const updateStepStatus = (step: StepName, status: StepStatus) => {
    setSteps(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const stepFunctions = [
    runStartStep,
    runEmbeddingStep,
    runRetrievalStep,
    runThinkStep,
    runPlanStep,
    runActStep,
    runPRStep,
    runCompletedStep
  ]

  const runNextStep = async (stepIndex = currentStepIndex) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // wait 1s for animation

    if (stepIndex < stepFunctions.length) {
      const currentStepFunction = stepFunctions[stepIndex]
      const stepName = [
        "started",
        "embedding",
        "retrieval",
        "think",
        "plan",
        "act",
        "pr",
        "completed"
      ][stepIndex] as StepName

      updateStepStatus(stepName, "in_progress")

      try {
        await currentStepFunction({
          issue,
          project,
          attachedInstructions,
          setCurrentStep,
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
            setAIResponses(prev => ({ ...prev, [type]: response })),
          updateStepStatus: (status: StepStatus) =>
            updateStepStatus(stepName, status)
        })
        updateStepStatus(stepName, "done")
      } catch (error) {
        console.error(`Error in step ${stepName}:`, error)
        updateStepStatus(stepName, "error")
        setIsRunning(false)
        return
      }

      // If the step is think or plan, we need to wait for confirmation
      if (["think", "plan"].includes(stepName)) {
        setWaitingForConfirmation(true)
        setCurrentStepIndex(stepIndex)
      } else {
        const nextStepIndex = stepIndex + 1
        setCurrentStepIndex(nextStepIndex)
        runNextStep(nextStepIndex)
      }
    } else {
      setIsRunning(false)
    }
  }

  const handleRun = async () => {
    if (!project.githubRepoFullName || !project.githubTargetBranch) {
      alert("Please connect your project to a GitHub repository first.")
      return
    }

    setIsRunning(true)
    setCurrentStepIndex(0)
    runNextStep(0)
  }

  const handleConfirmation = () => {
    setWaitingForConfirmation(false)
    const nextStepIndex = currentStepIndex + 1
    setCurrentStepIndex(nextStepIndex)
    runNextStep(nextStepIndex)
  }

  return {
    isRunning,
    currentStep,
    clarifications,
    thoughts,
    planSteps,
    generatedFiles,
    waitingForConfirmation,
    handleRun,
    setThoughts,
    setClarifications,
    setPlanSteps,
    setGeneratedFiles,
    handleConfirmation,
    steps,
    updateStepStatus
  }
}
